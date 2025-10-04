-- Crawler functions for task management

-- 1. Create scheduled task (exact time)
CREATE OR REPLACE FUNCTION crawler.create_scheduled_task(
    company_data_source_id INTEGER,
    scheduled_at TIMESTAMP WITH TIME ZONE
)
RETURNS INTEGER AS $$
DECLARE
    task_id INTEGER;
    company_id_val INTEGER;
BEGIN
    -- Get company_id from the data source
    SELECT company_id INTO company_id_val 
    FROM public.companies_data_sources 
    WHERE id = company_data_source_id;
    
    -- Check if data source exists
    IF company_id_val IS NULL THEN
        RAISE EXCEPTION 'Data source with id % not found', company_data_source_id;
    END IF;
    
    -- Create new task
    INSERT INTO crawler.task_list (
        company_id,
        data_source_id,
        scheduled_at,
        last_status_id
    ) VALUES (
        company_id_val,
        company_data_source_id,
        scheduled_at,
        (SELECT id FROM crawler.dictionary_status_list WHERE title = 'Planed')
    ) RETURNING id INTO task_id;
    
    -- Log the initial status
    INSERT INTO crawler.task_status_log (
        task_id,
        status_id,
        metadata
    ) VALUES (
        task_id,
        (SELECT id FROM crawler.dictionary_status_list WHERE title = 'Planed'),
        jsonb_build_object('created_at', NOW(), 'scheduled_at', scheduled_at)
    );
    
    RETURN task_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Create task (execute now)
CREATE OR REPLACE FUNCTION crawler.create_task(
    company_data_source_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    task_id INTEGER;
    company_id_val INTEGER;
BEGIN
    -- Get company_id from the data source
    SELECT company_id INTO company_id_val 
    FROM public.companies_data_sources 
    WHERE id = company_data_source_id;
    
    -- Check if data source exists
    IF company_id_val IS NULL THEN
        RAISE EXCEPTION 'Data source with id % not found', company_data_source_id;
    END IF;
    
    -- Create new task for immediate execution
    INSERT INTO crawler.task_list (
        company_id,
        data_source_id,
        scheduled_at,
        last_status_id
    ) VALUES (
        company_id_val,
        company_data_source_id,
        NOW(),
        (SELECT id FROM crawler.dictionary_status_list WHERE title = 'Planed')
    ) RETURNING id INTO task_id;
    
    -- Log the initial status
    INSERT INTO crawler.task_status_log (
        task_id,
        status_id,
        metadata
    ) VALUES (
        task_id,
        (SELECT id FROM crawler.dictionary_status_list WHERE title = 'Planed'),
        jsonb_build_object('created_at', NOW(), 'scheduled_at', NOW())
    );
    
    RETURN task_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Stop task (set status to 5 - Stoped)
CREATE OR REPLACE FUNCTION crawler.stop_task(
    task_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    stopped_status_id INTEGER;
BEGIN
    -- Get stopped status id
    SELECT id INTO stopped_status_id 
    FROM crawler.dictionary_status_list 
    WHERE title = 'Stoped';
    
    -- Log the status change (this will trigger the update of task_list.last_status_id)
    INSERT INTO crawler.task_status_log (
        task_id,
        status_id,
        metadata
    ) VALUES (
        task_id,
        stopped_status_id,
        jsonb_build_object('stopped_at', NOW())
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Get planned/scheduled tasks ready for execution
CREATE OR REPLACE FUNCTION crawler.get_tasks_ready_for_execution()
RETURNS TABLE (
    task_id INTEGER,
    data_source_id INTEGER,
    data_source_type_id INTEGER,
    data_source_type_title TEXT,
    url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as task_id,
        t.data_source_id,
        cds.type_id as data_source_type_id,
        dst.title as data_source_type_title,
        cds.url,
        t.scheduled_at
    FROM crawler.task_list t
    JOIN public.companies_data_sources cds ON t.data_source_id = cds.id
    JOIN dictionaries.data_sources_types dst ON cds.type_id = dst.id
    JOIN crawler.dictionary_status_list dsl ON t.last_status_id = dsl.id
    WHERE dsl.title = 'Planed' 
    AND t.scheduled_at <= NOW()
    ORDER BY t.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to calculate next scheduled time
CREATE OR REPLACE FUNCTION crawler.get_next_scheduled_time(
    company_data_source_id INTEGER,
    base_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    interval_minutes INTEGER;
BEGIN
    -- Get interval from data source
    SELECT it.minutes_interval INTO interval_minutes
    FROM public.companies_data_sources cds
    JOIN dictionaries.inverval_types it ON cds.inverval_type_id = it.id
    WHERE cds.id = company_data_source_id;
    
    -- Return base_time + interval
    RETURN base_time + (interval_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- 6. Auto-renewal trigger function
CREATE OR REPLACE FUNCTION crawler.auto_renewal_trigger()
RETURNS TRIGGER AS $$
DECLARE
    company_id_val INTEGER;
    data_source_id_val INTEGER;
    next_scheduled_time TIMESTAMP WITH TIME ZONE;
    new_task_id INTEGER;
BEGIN
    -- Check if task is completed (Success) or failed (Failed)
    IF NEW.last_status_id IN (
        SELECT id FROM crawler.dictionary_status_list 
        WHERE title IN ('Success', 'Failed')
    ) THEN
        
        -- Get task details
        SELECT company_id, data_source_id INTO company_id_val, data_source_id_val
        FROM crawler.task_list 
        WHERE id = NEW.id;
        
        -- Calculate next scheduled time
        SELECT crawler.get_next_scheduled_time(data_source_id_val, NOW()) INTO next_scheduled_time;
        
        -- Create new task with calculated scheduled time
        INSERT INTO crawler.task_list (
            company_id,
            data_source_id,
            scheduled_at,
            last_status_id
        ) VALUES (
            company_id_val,
            data_source_id_val,
            next_scheduled_time,
            (SELECT id FROM crawler.dictionary_status_list WHERE title = 'Planed')
        ) RETURNING id INTO new_task_id;
        
        -- Log the new task creation
        INSERT INTO crawler.task_status_log (
            task_id,
            status_id,
            metadata
        ) VALUES (
            new_task_id,
            (SELECT id FROM crawler.dictionary_status_list WHERE title = 'Planed'),
            jsonb_build_object(
                'auto_renewal', true,
                'parent_task_id', NEW.id,
                'scheduled_at', next_scheduled_time
            )
        );
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Add task status (insert into task_status_log)
CREATE OR REPLACE FUNCTION crawler.add_task_status(
    p_task_id INTEGER,
    p_status_title TEXT,
    p_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    status_id INTEGER;
BEGIN
    -- Get status ID
    SELECT id INTO status_id 
    FROM crawler.dictionary_status_list 
    WHERE title = p_status_title;
    
    IF status_id IS NULL THEN
        RAISE EXCEPTION 'Status "%" not found', p_status_title;
    END IF;
    
    -- Insert status log entry (this will trigger the update of task_list.last_status_id)
    INSERT INTO crawler.task_status_log (
        task_id,
        status_id,
        metadata
    ) VALUES (
        p_task_id,
        status_id,
        p_metadata
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for auto-renewal
CREATE TRIGGER auto_renewal_trigger
    AFTER UPDATE OF last_status_id ON crawler.task_list
    FOR EACH ROW
    EXECUTE FUNCTION crawler.auto_renewal_trigger();

-- 8. Create view for all planned tasks with additional info
CREATE OR REPLACE VIEW crawler.v_tasks_planned AS
SELECT 
    t.id as task_id,
    t.company_id,
    c.title as company_title,
    t.data_source_id,
    cds.url,
    cds.title as data_source_title,
    dst.title as data_source_type_title,
    it.title as interval_type_title,
    it.minutes_interval,
    dsl.title as status_title,
    t.scheduled_at,
    t.created_at,
    t.updated_at,
    -- Check if task is ready for execution (status = 'Planed' and scheduled_at <= NOW())
    CASE 
        WHEN dsl.title = 'Planed' AND t.scheduled_at <= NOW() THEN true
        ELSE false
    END as is_ready_for_execution,
    -- Calculate next scheduled time if task is active
    CASE 
        WHEN dsl.title = 'Planed' THEN crawler.get_next_scheduled_time(t.data_source_id, t.scheduled_at)
        ELSE NULL
    END as next_scheduled_time,
    --time to execution
    CASE 
        WHEN dsl.title = 'Planed' THEN t.scheduled_at - NOW()
        ELSE NULL
    END as time_to_execution
FROM crawler.task_list t
JOIN public.companies c ON t.company_id = c.id
JOIN public.companies_data_sources cds ON t.data_source_id = cds.id
JOIN dictionaries.data_sources_types dst ON cds.type_id = dst.id
JOIN dictionaries.inverval_types it ON cds.inverval_type_id = it.id
JOIN crawler.dictionary_status_list dsl ON t.last_status_id = dsl.id
where t.last_status_id = 1
ORDER BY t.scheduled_at DESC;

-- 9. Create view for all tasks with additional info
CREATE OR REPLACE VIEW crawler.v_tasks_all AS
SELECT 
    t.id as task_id,
    t.company_id,
    c.title as company_title,
    t.data_source_id,
    cds.url,
    cds.title as data_source_title,
    dst.title as data_source_type_title,
    it.title as interval_type_title,
    it.minutes_interval,
    dsl.title as status_title,
    t.scheduled_at,
    t.created_at,
    t.updated_at
FROM crawler.task_list t
JOIN public.companies c ON t.company_id = c.id
JOIN public.companies_data_sources cds ON t.data_source_id = cds.id
JOIN dictionaries.data_sources_types dst ON cds.type_id = dst.id
JOIN dictionaries.inverval_types it ON cds.inverval_type_id = it.id
JOIN crawler.dictionary_status_list dsl ON t.last_status_id = dsl.id
ORDER BY t.scheduled_at DESC;

--To executtion task views:

CREATE OR REPLACE VIEW crawler.v_tasks_to_execution AS
SELECT * from crawler.v_tasks_planned where is_ready_for_execution = true;