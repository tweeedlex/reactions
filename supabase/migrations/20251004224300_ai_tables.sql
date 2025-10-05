-- AI Tables Migration
-- This migration creates the AI-related tables for message analysis and answer suggestions

-- 1. AI Company FAQ URL Sources table
-- Stores information about URL sources (FAQs, knowledge bases) used by AI
CREATE TABLE public.ai_company_faq_url_sources (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_ai_company_faq_url_sources_company_id ON public.ai_company_faq_url_sources(company_id);
CREATE INDEX idx_ai_company_faq_url_sources_url ON public.ai_company_faq_url_sources(url);

-- 2. AI Message Analysis table
-- Stores results of AI-driven message analysis
CREATE TABLE public.ai_msg_analyze (
    id BIGSERIAL PRIMARY KEY,
    msg_id BIGINT NOT NULL REFERENCES crawler.company_messages(id) ON DELETE CASCADE,
    msg_ticket_type_id BIGINT REFERENCES dictionaries.msg_ticket_types(id) ON DELETE SET NULL,
    theme_text TEXT,
    ton_of_voice_value SMALLINT, -- Tone of voice value
    tags_array TEXT[], -- Array of tags associated with the message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_ai_msg_analyze_msg_id ON public.ai_msg_analyze(msg_id);
CREATE INDEX idx_ai_msg_analyze_msg_ticket_type_id ON public.ai_msg_analyze(msg_ticket_type_id);
CREATE INDEX idx_ai_msg_analyze_created_at ON public.ai_msg_analyze(created_at);

-- 3. AI Message Answer Suggestions table
-- Stores AI-generated answer suggestions for analyzed messages
CREATE TABLE public.ai_msg_answers_suggestions (
    id BIGSERIAL PRIMARY KEY,
    llm_msg_an_id BIGINT NOT NULL REFERENCES public.ai_msg_analyze(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    company_answer_data_source_id BIGINT NULL REFERENCES public.ai_company_faq_url_sources(id) ON DELETE SET NULL,
    --confidence_score DECIMAL(3,2), -- Confidence score for the suggestion (0.00 to 1.00)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_ai_msg_answers_suggestions_llm_msg_an_id ON public.ai_msg_answers_suggestions(llm_msg_an_id);
CREATE INDEX idx_ai_msg_answers_suggestions_company_answer_data_source_id ON public.ai_msg_answers_suggestions(company_answer_data_source_id);
--CREATE INDEX idx_ai_msg_answers_suggestions_confidence_score ON public.ai_msg_answers_suggestions(confidence_score);

