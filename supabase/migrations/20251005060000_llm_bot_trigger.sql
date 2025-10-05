-- Создаем таблицу для очереди анализа
CREATE TABLE IF NOT EXISTS public.llm_analysis_queue (
    id SERIAL PRIMARY KEY,
    msg_id BIGINT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Создаем функцию для добавления в очередь
CREATE OR REPLACE FUNCTION public.queue_llm_analysis(p_msg_id BIGINT)
RETURNS JSON AS $$
BEGIN
    -- Добавляем в очередь
    INSERT INTO public.llm_analysis_queue (msg_id, status)
    VALUES (p_msg_id, 'pending');
    
    RETURN json_build_object(
        'success', true,
        'msg_id', p_msg_id,
        'message', 'Added to analysis queue'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'msg_id', p_msg_id
    );
END;
$$ LANGUAGE plpgsql;

-- Создаем триггерную функцию
CREATE OR REPLACE FUNCTION public.trigger_llm_analysis()
RETURNS TRIGGER AS $$
BEGIN
    -- Вызываем анализ только для новых записей
    IF TG_OP = 'INSERT' THEN
        -- Добавляем в очередь для обработки
        PERFORM public.queue_llm_analysis(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
DROP TRIGGER IF EXISTS llm_analysis_trigger ON crawler.company_messages;
CREATE TRIGGER llm_analysis_trigger
    AFTER INSERT ON crawler.company_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_llm_analysis();

-- Создаем функцию для ручного вызова анализа
CREATE OR REPLACE FUNCTION public.analyze_message_manually(p_msg_id BIGINT)
RETURNS JSON AS $$
BEGIN
    RETURN public.queue_llm_analysis(p_msg_id);
END;
$$ LANGUAGE plpgsql;
