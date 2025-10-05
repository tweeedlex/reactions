-- Create dictionaries schema
CREATE SCHEMA IF NOT EXISTS dictionaries;

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    site_url TEXT
);

-- Create companies_roles table
CREATE TABLE IF NOT EXISTS dictionaries.system_roles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL
    -- created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_companies 
CREATE TABLE IF NOT EXISTS public.user_companies (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES dictionaries.system_roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, company_id)
);

-- Create data_sources_types dictionary table
CREATE TABLE IF NOT EXISTS dictionaries.data_sources_types (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL
);

-- Create inverval_types dictionary table
CREATE TABLE IF NOT EXISTS dictionaries.inverval_types (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    minutes_interval INTEGER NOT NULL
);

-- Create companies_data_sources table
CREATE TABLE IF NOT EXISTS public.companies_data_sources (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    type_id INTEGER NOT NULL REFERENCES dictionaries.data_sources_types(id) ON DELETE CASCADE,
    --freq_req_per_day INTEGER,
    inverval_type_id INTEGER NOT NULL REFERENCES dictionaries.inverval_types(id) ON DELETE CASCADE,
    title TEXT,
    url TEXT NOT NULL
);

-- Create msg_ticket_types dictionary table
CREATE TABLE IF NOT EXISTS dictionaries.msg_ticket_types (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NULL REFERENCES public.companies(id) ON DELETE CASCADE, -- Ставим пока NULL = для всех компаний дефолтные типы
    title TEXT NOT NULL,
    priority_rank INTEGER
);

-- Create msg_ton_of_voices dictionary table
CREATE TABLE IF NOT EXISTS dictionaries.msg_ton_of_voices (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    value SMALLINT NOT NULL CHECK (value >= -100 AND value <= 100) -- value from -100 to 100 (represents -1.00 to 1.00 with 2 decimal places)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON public.user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON public.user_companies(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_data_sources_company_id ON public.companies_data_sources(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_data_sources_type_id ON public.companies_data_sources(type_id);
--CREATE INDEX IF NOT EXISTS idx_msg_ticket_types_company_id ON dictionaries.msg_ticket_types(company_id);

-- -- Enable Row Level Security (RLS)
-- ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.system_roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.companies_data_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dictionaries.msg_ticket_types ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dictionaries.msg_ton_of_voices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dictionaries.data_sources_types ENABLE ROW LEVEL SECURITY;

-- -- Create RLS policies for companies
-- CREATE POLICY "Users can view companies they belong to" ON public.companies
--     FOR SELECT USING (
--         id IN (
--             SELECT company_id FROM public.user_companies 
--             WHERE user_id = auth.uid()
--         )
--     );

-- CREATE POLICY "Users can update companies they belong to" ON public.companies
--     FOR UPDATE USING (
--         id IN (
--             SELECT company_id FROM public.user_companies 
--             WHERE user_id = auth.uid()
--         )
--     );

-- -- Create RLS policies for user_companies
-- CREATE POLICY "Users can view their own company relationships" ON public.user_companies
--     FOR SELECT USING (user_id = auth.uid());

-- CREATE POLICY "Users can insert their own company relationships" ON public.user_companies
--     FOR INSERT WITH CHECK (user_id = auth.uid());

-- CREATE POLICY "Users can update their own company relationships" ON public.user_companies
--     FOR UPDATE USING (user_id = auth.uid());

-- CREATE POLICY "Users can delete their own company relationships" ON public.user_companies
--     FOR DELETE USING (user_id = auth.uid());

-- -- Create RLS policies for companies_data_sources
-- CREATE POLICY "Users can view data sources of their companies" ON public.companies_data_sources
--     FOR SELECT USING (
--         company_id IN (
--             SELECT company_id FROM public.user_companies 
--             WHERE user_id = auth.uid()
--         )
--     );

-- CREATE POLICY "Users can manage data sources of their companies" ON public.companies_data_sources
--     FOR ALL USING (
--         company_id IN (
--             SELECT company_id FROM public.user_companies 
--             WHERE user_id = auth.uid()
--         )
--     );

-- -- Create RLS policies for msg_ticket_types (global dictionary, no company restriction)
-- CREATE POLICY "Authenticated users can view ticket types" ON dictionaries.msg_ticket_types
--     FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can manage ticket types" ON dictionaries.msg_ticket_types
--     FOR ALL USING (auth.role() = 'authenticated');

-- -- Create RLS policies for dictionaries (read-only for all authenticated users)
-- CREATE POLICY "Authenticated users can view data source types" ON dictionaries.data_sources_types
--     FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can view ton of voices" ON dictionaries.msg_ton_of_voices
--     FOR SELECT USING (auth.role() = 'authenticated');

-- -- Create RLS policies for system_roles (read-only for all authenticated users)
-- CREATE POLICY "Authenticated users can view system roles" ON public.system_roles
--     FOR SELECT USING (auth.role() = 'authenticated');
