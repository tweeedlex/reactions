CREATE OR REPLACE FUNCTION public.save_llm_analysis(
    p_msg_id BIGINT,
    p_msg_ticket_type_id BIGINT DEFAULT NULL,
    p_theme_text TEXT DEFAULT NULL,
    p_ton_of_voice_value SMALLINT DEFAULT NULL,
    p_tags_array TEXT[] DEFAULT NULL,
    p_answer_text TEXT DEFAULT NULL,
    p_company_answer_data_source_id BIGINT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    analysis_id BIGINT;
BEGIN
    -- Insert or update AI analysis
    INSERT INTO public.ai_msg_analyze (
        msg_id,
        msg_ticket_type_id,
        theme_text,
        ton_of_voice_value,
        tags_array,
        answer_text,
        company_answer_data_source_id
    ) VALUES (
        p_msg_id,
        p_msg_ticket_type_id,
        p_theme_text,
        p_ton_of_voice_value,
        p_tags_array,
        p_answer_text,
        p_company_answer_data_source_id
    )
    RETURNING id INTO analysis_id;
    
    RETURN analysis_id;
END;
$$ LANGUAGE plpgsql;