-- Function to add crawling results
CREATE OR REPLACE FUNCTION crawler.add_crawling_result(
    p_task_id INTEGER,
    p_text TEXT,
    p_context JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    result_id INTEGER;
BEGIN
    -- Insert crawling result
    INSERT INTO crawler.company_messages (
        task_id,
        text,
        context
    ) VALUES (
        p_task_id,
        p_text,
        p_context
    ) RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add multiple crawling results at once
CREATE OR REPLACE FUNCTION crawler.add_crawling_results(
    p_task_id INTEGER,
    p_results JSONB
)
RETURNS INTEGER AS $$
DECLARE
    result_id INTEGER;
    result_item JSONB;
    inserted_count INTEGER := 0;
BEGIN
    -- Loop through results array
    FOR result_item IN SELECT * FROM jsonb_array_elements(p_results)
    LOOP
        INSERT INTO crawler.company_messages (
            task_id,
            text,
            context
        ) VALUES (
            p_task_id,
            result_item->>'text',
            result_item->'context'
        );
        
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;