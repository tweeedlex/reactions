# 🤖 Автоматический анализ сообщений

## Как это работает

1. **Новая запись** в `crawler.company_messages` → **Триггер** автоматически срабатывает
2. **Триггер** добавляет задачу в очередь `public.llm_analysis_queue`
3. **Обработчик очереди** (Edge Function `process-queue`) обрабатывает задачи
4. **Edge Function** получает данные через `public.get_llm_prompt_by_msg_id(msg_id)`
5. **Edge Function** отправляет HTTP запрос на ваш LLM Bot
6. **LLM Bot** анализирует и сохраняет результат через `save_llm_analysis`

## Настройка

### 1. Примените миграцию

```bash
supabase db reset
```

### 2. Настройте переменные окружения (опционально)

```bash
# Для локальной разработки (по умолчанию)
# SUPABASE_URL=http://127.0.0.1:54321
# LLM_BOT_URL=http://host.docker.internal:3001/analyze

# Для продакшена
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set LLM_BOT_URL=https://your-llm-bot.com/analyze
```

### 3. Разверните Edge Functions

```bash
supabase functions deploy process-queue
```

### 4. Запустите LLM Bot

```bash
# Локально
npm start

# Или через Docker
docker-compose up -d
```

### 5. Запустите обработчик очереди

```bash
# Обработка очереди каждые 30 секунд
npm run queue:process
```

## Тестирование

### Ручной вызов анализа

```sql
-- Протестируйте функцию вручную
SELECT public.analyze_message_manually(2);
```

### Автоматический триггер

```sql
-- Вставьте новую запись - триггер сработает автоматически
INSERT INTO crawler.company_messages (text, context, created_at) 
VALUES ('Тестовое сообщение', '{}', NOW());
```

## Структура данных

### Входные данные (от `get_llm_prompt_by_msg_id`)

```json
{
  "system_prompt": "Ти — Асистент служби підтримки...",
  "request_params": {
    "message": { "text": "Клиент жалуется..." },
    "company": { "title": "Rozetka" },
    "faq_sources": [...],
    "ticket_types": [...]
  }
}
```

### Отправка в LLM Bot

```json
{
  "msg_id": 2,
  "system_prompt": "Ти — Асистент служби підтримки...",
  "request_params": { ... }
}
```

### Ответ от LLM Bot

```json
{
  "success": true,
  "analysis": {
    "theme_text": "Проблемы с производительностью",
    "ton_of_voice_value": -60,
    "tags_array": ["жалоба", "сайт"],
    "answer_text": "Здравствуйте! Спасибо за обратную связь...",
    "msg_ticket_type_id": 1,
    "company_answer_data_source_id": 2,
    "msg_id": 2
  }
}
```

## Мониторинг

### Проверка логов

```sql
-- Последние анализы
SELECT * FROM public.ai_msg_analyze ORDER BY created_at DESC LIMIT 10;

-- Статистика
SELECT 
  COUNT(*) as total_analyses,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour
FROM public.ai_msg_analyze;
```

### Проверка триггера

```sql
-- Проверьте, что триггер активен
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'llm_analysis_trigger';
```

## Устранение неполадок

### Триггер не срабатывает

1. Проверьте, что триггер создан:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'llm_analysis_trigger';
```

2. Проверьте секрет:
```sql
SELECT * FROM vault.decrypted_secrets 
WHERE name = 'LLM_BOT_URL_ENDPOINT';
```

### LLM Bot недоступен

1. Проверьте, что LLM Bot запущен
2. Проверьте URL в секретах
3. Проверьте сетевую доступность

### Ошибки анализа

1. Проверьте логи LLM Bot
2. Проверьте данные в `get_llm_prompt_by_msg_id`
3. Проверьте формат ответа от LLM Bot
