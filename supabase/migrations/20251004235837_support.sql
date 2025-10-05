-- Support module migration
-- Creates tables for support ticket management system

-- Create company_tags table for tagging support tickets
CREATE TABLE IF NOT EXISTS public.company_tags (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    attention_rank INTEGER CHECK (attention_rank >= 0 AND attention_rank <= 100) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets_status dictionary table
CREATE TABLE IF NOT EXISTS dictionaries.tickets_status (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create msg_ticket_types dictionary table
CREATE TABLE IF NOT EXISTS dictionaries.msg_ticket_types (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    priority_rank INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create main company_support_tickets table
CREATE TABLE IF NOT EXISTS public.company_support_tickets (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES public.company_messages(id) ON DELETE CASCADE,
    status_id INTEGER NOT NULL REFERENCES dictionaries.tickets_status(id),
    ticket_type_id INTEGER NOT NULL REFERENCES dictionaries.msg_ticket_types(id),
    tags_array TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_user_id UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_support_tickets_message_id ON public.company_support_tickets(message_id);
CREATE INDEX IF NOT EXISTS idx_company_support_tickets_status_id ON public.company_support_tickets(status_id);
CREATE INDEX IF NOT EXISTS idx_company_support_tickets_ticket_type_id ON public.company_support_tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_company_support_tickets_created_at ON public.company_support_tickets(created_at);
-- Index for tags array search
CREATE INDEX IF NOT EXISTS idx_company_support_tickets_tags ON public.company_support_tickets USING GIN(tags_array);

CREATE INDEX IF NOT EXISTS idx_msg_ticket_types_priority_rank ON dictionaries.msg_ticket_types(priority_rank);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_company_tags_updated_at 
    BEFORE UPDATE ON public.company_tags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_support_tickets_updated_at 
    BEFORE UPDATE ON public.company_support_tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_msg_ticket_types_updated_at 
    BEFORE UPDATE ON dictionaries.msg_ticket_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default ticket statuses
INSERT INTO dictionaries.tickets_status (title) VALUES 
    ('Open'),
    ('In Progress'),
    ('Solved'),
    ('Closed'),
    ('Pending')
ON CONFLICT (title) DO NOTHING;


--Нужно добавить логику автосоздания тикетов из сообщений в таблице company_messages

-- Create comprehensive view for support tickets with AI data
CREATE OR REPLACE VIEW public.v_company_support_tickets AS
SELECT 
    -- Basic ticket information
    cst.id,

    ts.title AS status_title,
    mtt.title AS ticket_type_title,
    ama.theme_text AS ai_theme,
    cm.text AS user_message,
    ama.ton_of_voice_value AS ai_ton_of_voice_value,
    mtov.title AS ai_ton_of_voice_title,
    ama.tags_array,
    amas.answer_text AS ai_suggested_answer_text,
    acfus.title AS ai_company_answer_data_source_title,
    acfus.url AS ai_company_answer_data_source_url,

    -- Company information
    c.title AS company_name,
    cst.created_at,
    cst.updated_at,
    cst.updated_user_id,
    c.id AS company_id
    
FROM public.company_support_tickets cst
-- Join with messages
LEFT JOIN public.company_messages cm ON cst.message_id = cm.id
-- Join with AI analysis
LEFT JOIN public.ai_msg_analyze ama ON cm.id = ama.msg_id
-- Join with ticket types
LEFT JOIN dictionaries.msg_ticket_types mtt ON cst.ticket_type_id = mtt.id
-- Join with status
LEFT JOIN dictionaries.tickets_status ts ON cst.status_id = ts.id
-- Join with AI answer suggestions
LEFT JOIN public.ai_msg_answers_suggestions amas ON ama.id = amas.llm_msg_an_id
-- Join with AI data sources
LEFT JOIN public.ai_company_faq_url_sources acfus ON amas.company_answer_data_source_id = acfus.id
-- Join with ton of voice (find closest value)
LEFT JOIN dictionaries.msg_ton_of_voices mtov ON (
    mtov.value = (
        SELECT value 
        FROM dictionaries.msg_ton_of_voices 
        WHERE value <= ama.ton_of_voice_value 
        ORDER BY value DESC 
        LIMIT 1
    )
)
-- Join with companies (through task_id -> company_id)
LEFT JOIN crawler.task_list tl ON cm.task_id = tl.id
LEFT JOIN public.companies c ON tl.company_id = c.id;


