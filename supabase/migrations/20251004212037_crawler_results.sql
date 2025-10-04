--crawler.company_messages

CREATE TABLE crawler.company_messages (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES crawler.task_list(id) ON DELETE CASCADE,
    text TEXT,
    context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


--view with all company messages info with titles and companies

CREATE OR REPLACE VIEW crawler.v_company_messages AS
SELECT 
    cm.id,
    cm.task_id,
    t.company_id,
    c.title as company_title,
    cm.text,
    cm.context,
    cds.title as data_source_title,
    dst.title as data_source_type_title,
    --it.title as interval_type_title,
    --it.minutes_interval,
    --dsl.title as status_title,
    --t.scheduled_at,
    --t.created_at as task_created_at,
    --t.updated_at as task_updated_at,
    cds.url,
    cm.created_at
FROM crawler.company_messages cm
JOIN crawler.task_list t ON cm.task_id = t.id
JOIN public.companies c ON t.company_id = c.id
JOIN public.companies_data_sources cds ON t.data_source_id = cds.id
JOIN dictionaries.data_sources_types dst ON cds.type_id = dst.id
JOIN dictionaries.inverval_types it ON cds.inverval_type_id = it.id
JOIN crawler.dictionary_status_list dsl ON t.last_status_id = dsl.id
ORDER BY cm.created_at DESC;