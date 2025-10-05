--table dictionaries.sys_prompts

CREATE TABLE IF NOT EXISTS dictionaries.sys_prompts (
    id SERIAL PRIMARY KEY,
    code_name TEXT NOT NULL UNIQUE,
    prompt TEXT NOT NULL
);

-- Create view for LLM prompt with all necessary information
CREATE OR REPLACE VIEW public.v_llm_msg_prompt AS
SELECT 
    -- Message information
    cm.id AS msg_id,
    cm.text AS message_text,
    cm.context AS message_context,
    
    -- Company information
    c.title AS brand_title,
    
    -- Data source information
    cds.url AS source_url,
    cds.title AS source_title,
    dst.title AS source_type_title,
    
    -- System prompt (from dictionaries.sys_prompts)
    sp.prompt AS system_prompt,
    
    -- FAQ sources as JSON array with id and url
    COALESCE(
        ARRAY_AGG(
            JSON_BUILD_OBJECT(
                'id', acfus.id,
                'url', acfus.url,
                'title', acfus.title
            )
        ) FILTER (WHERE acfus.id IS NOT NULL),
        ARRAY[]::JSON[]
    ) AS array_fqa_sources,
    
    -- Company tags array (from company_tags)
    COALESCE(
        ARRAY_AGG(DISTINCT ct.title) FILTER (WHERE ct.title IS NOT NULL),
        ARRAY[]::TEXT[]
    ) AS array_company_tags,
    
    -- Message ticket types as JSON array with id and title
    COALESCE(
        ARRAY_AGG(
            JSON_BUILD_OBJECT(
                'id', mtt.id,
                'title', mtt.title,
                'priority_rank', mtt.priority_rank
            )
        ) FILTER (WHERE mtt.id IS NOT NULL),
        ARRAY[]::JSON[]
    ) AS array_msg_ticket_types,
    
    -- Timestamps
    cm.created_at AS message_created_at

FROM crawler.company_messages cm
-- Join with task to get company info
JOIN crawler.task_list tl ON cm.task_id = tl.id
JOIN public.companies c ON tl.company_id = c.id
-- Join with data source
JOIN public.companies_data_sources cds ON tl.data_source_id = cds.id
JOIN dictionaries.data_sources_types dst ON cds.type_id = dst.id
-- Join with system prompt (default one for now)
LEFT JOIN dictionaries.sys_prompts sp ON sp.code_name = 'default_llm_prompt'
-- Join with FAQ URLs for this company
LEFT JOIN public.ai_company_faq_url_sources acfus ON c.id = acfus.company_id
-- Join with company tags
LEFT JOIN public.company_tags ct ON c.id = ct.company_id
-- Join with message ticket types for this company
LEFT JOIN dictionaries.msg_ticket_types mtt ON c.id = mtt.company_id

GROUP BY 
    cm.id, cm.text, cm.context, cm.created_at,
    c.title, c.id,
    cds.url, cds.title, dst.title,
    sp.prompt

ORDER BY cm.created_at DESC;

-- Function to get LLM prompt data by message ID (structured for LLM)
CREATE OR REPLACE FUNCTION public.get_llm_prompt_by_msg_id(p_msg_id INTEGER)
RETURNS TABLE (
    msg_id INTEGER,
    system_prompt TEXT,
    request_params JSON
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.msg_id,
        v.system_prompt,
        JSON_BUILD_OBJECT(
            'message', JSON_BUILD_OBJECT(
                'id', v.msg_id,
                'text', v.message_text,
                'context', v.message_context,
                'created_at', v.message_created_at
            ),
            'company', JSON_BUILD_OBJECT(
                'title', v.brand_title,
                'tags', v.array_company_tags
            ),
            'faq_sources', (
                SELECT COALESCE(
                    ARRAY_AGG(DISTINCT jsonb_build_object(
                        'id', faq_item->>'id',
                        'url', faq_item->>'url', 
                        'title', faq_item->>'title'
                    )),
                    ARRAY[]::jsonb[]
                )
                FROM jsonb_array_elements(to_jsonb(v.array_fqa_sources)) AS faq_item
            ),
            'ticket_types', (
                SELECT COALESCE(
                    ARRAY_AGG(DISTINCT jsonb_build_object(
                        'id', ticket_item->>'id',
                        'title', ticket_item->>'title',
                        'priority_rank', ticket_item->>'priority_rank'
                    )),
                    ARRAY[]::jsonb[]
                )
                FROM jsonb_array_elements(to_jsonb(v.array_msg_ticket_types)) AS ticket_item
            ),
            'raw_data', JSON_BUILD_OBJECT(
                'msg_id', v.msg_id,
                'message_text', v.message_text,
                'message_context', v.message_context,
                'brand_title', v.brand_title,
                'source_url', v.source_url,
                'source_title', v.source_title,
                'source_type_title', v.source_type_title,
                'array_fqa_sources', (
                    SELECT COALESCE(
                        ARRAY_AGG(DISTINCT jsonb_build_object(
                            'id', faq_item->>'id',
                            'url', faq_item->>'url', 
                            'title', faq_item->>'title'
                        )),
                        ARRAY[]::jsonb[]
                    )
                    FROM jsonb_array_elements(to_jsonb(v.array_fqa_sources)) AS faq_item
                ),
                'array_company_tags', v.array_company_tags,
                'array_msg_ticket_types', (
                    SELECT COALESCE(
                        ARRAY_AGG(DISTINCT jsonb_build_object(
                            'id', ticket_item->>'id',
                            'title', ticket_item->>'title',
                            'priority_rank', ticket_item->>'priority_rank'
                        )),
                        ARRAY[]::jsonb[]
                    )
                    FROM jsonb_array_elements(to_jsonb(v.array_msg_ticket_types)) AS ticket_item
                ),
                'message_created_at', v.message_created_at
            )
        ) AS request_params
    FROM public.v_llm_msg_prompt v
    WHERE v.msg_id = p_msg_id;
END;
$$;

