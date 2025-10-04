-- Create crawler schema
CREATE SCHEMA IF NOT EXISTS crawler;

-- Create dictionary_status_list table
CREATE TABLE crawler.dictionary_status_list (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT
);

-- Create task_list table
CREATE TABLE crawler.task_list (
    id SERIAL PRIMARY KEY, -- ID SERIAL COZ EAZY FOR TESTS
    company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
    data_source_id INTEGER REFERENCES public.companies_data_sources(id) ON DELETE CASCADE,
    --original_task_id INTEGER REFERENCES crawler.task_list(id) ON DELETE SET NULL,
    --retry_attempt INTEGER DEFAULT 0,
    --max_retries INTEGER DEFAULT 3,
    last_status_id INTEGER REFERENCES crawler.dictionary_status_list(id),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_status_log table
CREATE TABLE crawler.task_status_log (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES crawler.task_list(id) ON DELETE CASCADE,
    status_id INTEGER REFERENCES crawler.dictionary_status_list(id),
    --error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_messages table
CREATE TABLE public.company_messages (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES crawler.task_list(id) ON DELETE CASCADE,
    text TEXT,
    context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Create indexes for better performance
CREATE INDEX idx_task_list_company_id ON crawler.task_list(company_id);
CREATE INDEX idx_task_list_data_source_id ON crawler.task_list(data_source_id);

CREATE INDEX idx_task_list_last_status_id ON crawler.task_list(last_status_id);
CREATE INDEX idx_task_list_scheduled_at ON crawler.task_list(scheduled_at);
CREATE INDEX idx_task_status_log_task_id ON crawler.task_status_log(task_id);
CREATE INDEX idx_task_status_log_status_id ON crawler.task_status_log(status_id);
CREATE INDEX idx_task_status_log_created_at ON crawler.task_status_log(created_at);
CREATE INDEX idx_company_messages_task_id ON public.company_messages(task_id);
CREATE INDEX idx_company_messages_created_at ON public.company_messages(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION crawler.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to update task last_status_id from status log
CREATE OR REPLACE FUNCTION crawler.update_task_last_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the task's last_status_id with the latest status from the log
    UPDATE crawler.task_list 
    SET 
        last_status_id = NEW.status_id,
        updated_at = NOW()
    WHERE id = NEW.task_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for task_list updated_at
CREATE TRIGGER update_task_list_updated_at 
    BEFORE UPDATE ON crawler.task_list 
    FOR EACH ROW 
    EXECUTE FUNCTION crawler.update_updated_at_column();

-- Create trigger to update task last_status_id when status log is inserted
CREATE TRIGGER update_task_last_status_trigger
    AFTER INSERT ON crawler.task_status_log
    FOR EACH ROW
    EXECUTE FUNCTION crawler.update_task_last_status();


-- Insert default status values
INSERT INTO crawler.dictionary_status_list (title, description) VALUES
    ('Planed', 'Task is planned and waiting to be executed'),
    ('Started', 'Task execution has started'),
    ('Failed', 'Task execution failed'),
    ('Success', 'Task completed successfully'),
    ('Stoped', 'Task execution was stopped');