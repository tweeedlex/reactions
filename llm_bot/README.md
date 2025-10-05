# LLM Bot

Простой Node.js бот для анализа сообщений с помощью LLM моделей и интеграции с Supabase.

## Возможности

- 🤖 Поддержка множества LLM провайдеров (OpenAI, Claude, Gemini, Ollama)
- 🗄️ Интеграция с Supabase для хранения результатов
- 🚀 Простой REST API
- 🔧 Гибкая конфигурация
- 📊 Мониторинг и логирование

## Поддерживаемые LLM провайдеры

- **OpenAI** (GPT-4, GPT-3.5)
- **Anthropic Claude** (Claude-3)
- **Google Gemini**
- **Ollama** (локальные модели)

## Установка

1. **Клонируйте репозиторий и перейдите в папку:**
```bash
cd llm_bot
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Настройте переменные окружения:**
```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

4. **Запустите сервер:**
```bash
# Development режим
npm run dev

# Production режим
npm start
```

## Конфигурация

### Переменные окружения

Скопируйте `env.example` в `.env` и настройте:

```env
# Supabase
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key

# LLM провайдер (выберите один)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
GEMINI_API_KEY=your-gemini-key

# Сервер
PORT=3001
DEFAULT_LLM_PROVIDER=openai
```

### Настройка LLM провайдеров

#### OpenAI
```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

#### Anthropic Claude
```env
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-sonnet-20240229
```

#### Google Gemini
```env
GEMINI_API_KEY=AI...
```

#### Ollama (локально)
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## API Endpoints

### POST /analyze
Анализирует сообщение с помощью LLM.

**Запрос:**
```json
{
  "msg_id": 2,
  "system_prompt": "Ти — Асистент служби підтримки клієнтів...",
  "request_params": {
    "message": {
      "text": "Клиент жалуется на медленную работу сайта"
    }
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "analysis": {
    "theme_text": "Проблемы с производительностью сайта",
    "ton_of_voice_value": -60,
    "tags_array": ["жалоба", "медленная работа", "сайт"],
    "answer_text": "Здравствуйте! Спасибо за ваш обратный связь...",
    "msg_ticket_type_id": 1,
    "company_answer_data_source_id": 2,
    "msg_id": 2
  }
}
```

### GET /health
Проверка состояния сервера.

### GET /providers
Получить список доступных LLM провайдеров.

### GET /system-prompt
Получить системный промпт из Supabase.

## Docker

### Сборка и запуск

```bash
# Сборка образа
npm run docker:build

# Запуск контейнера
npm run docker:run

# Или через Docker Compose
npm run docker:up

# Остановка
npm run docker:down

# Просмотр логов
npm run docker:logs
```

### Docker Compose

```bash
# Запуск в фоне
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

## Использование

### Пример с curl

```bash
# Анализ сообщения
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "msg_id": 2,
    "system_prompt": "Analyze customer message and return JSON with: theme_text, ton_of_voice_value (number -100 to 100), tags_array, answer_text, msg_ticket_type_id, company_answer_data_source_id",
    "request_params": {
      "message": {
        "text": "Клиент жалуется на медленную работу сайта"
      }
    }
  }'

# Проверка здоровья
curl http://localhost:3001/health

# Список провайдеров
curl http://localhost:3001/providers
```

### Пример с JavaScript

```javascript
const response = await fetch('http://localhost:3001/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    msg_id: 2,
    system_prompt: 'Analyze customer message and return JSON with: theme_text, ton_of_voice_value (number -100 to 100), tags_array, answer_text, msg_ticket_type_id, company_answer_data_source_id',
    request_params: {
      message: {
        text: 'Клиент жалуется на медленную работу сайта'
      }
    }
  })
});

const result = await response.json();
console.log(result);
```


## Разработка

### Структура проекта
```
llm_bot/
├── llm-bot.js          # Основной сервер
├── package.json        # Зависимости
├── env.example         # Пример конфигурации
├── README.md           # Документация
└── QUICK_START.md      # Быстрый старт
```

### Добавление нового LLM провайдера

1. Добавьте конфигурацию в `LLM_CONFIG`
2. Реализуйте логику в `callLLM()`
3. Обновите документацию

### Логирование

Сервер выводит подробные логи:
- Время обработки запросов
- Ошибки LLM API
- Результаты анализа
- Состояние Supabase

## Troubleshooting

### Частые проблемы

1. **Ошибка Supabase подключения**
   - Проверьте `SUPABASE_URL` и `SUPABASE_ANON_KEY`
   - Убедитесь, что Supabase запущен

2. **Ошибка LLM API**
   - Проверьте API ключи
   - Убедитесь в наличии интернет-соединения
   - Проверьте лимиты API

3. **Ошибка парсинга JSON**
   - LLM возвращает некорректный JSON
   - Проверьте системный промпт в Supabase

### Логи

```bash
# Запуск с подробными логами
DEBUG=* npm start

# Только ошибки
NODE_ENV=production npm start
```

## Лицензия

MIT
