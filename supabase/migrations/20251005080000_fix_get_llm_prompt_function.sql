-- Удаляем старую функцию и создаем новую
DROP FUNCTION IF EXISTS public.get_llm_prompt_by_msg_id(BIGINT);
DROP FUNCTION IF EXISTS public.get_llm_prompt_by_msg_id(INTEGER);

-- Создаем функцию для получения данных промпта по msg_id
CREATE OR REPLACE FUNCTION public.get_llm_prompt_by_msg_id(p_msg_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Получаем данные из view
    SELECT json_build_object(
        'msg_id', msg_id,
        'system_prompt', system_prompt,
        'request_params', json_build_object(
            'message', json_build_object(
                'id', msg_id,
                'text', message_text,
                'context', message_context,
                'created_at', message_created_at
            ),
            'company', json_build_object(
                'title', brand_title,
                'tags', array_company_tags
            ),
            'faq_sources', array_fqa_sources,
            'ticket_types', array_msg_ticket_types,
            'raw_data', json_build_object(
                'msg_id', msg_id,
                'message_text', message_text,
                'message_context', message_context,
                'brand_title', brand_title,
                'source_url', source_url,
                'source_title', source_title,
                'source_type_title', source_type_title,
                'array_fqa_sources', array_fqa_sources,
                'array_company_tags', array_company_tags,
                'array_msg_ticket_types', array_msg_ticket_types,
                'message_created_at', message_created_at
            )
        )
    ) INTO result
    FROM public.v_llm_msg_prompt
    WHERE msg_id = p_msg_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
