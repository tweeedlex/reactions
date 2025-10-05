#!/bin/bash

# Скрипт для настройки переменных окружения для автоматического анализа

echo "🔧 Setting up environment variables for auto analysis..."

# Проверяем, что мы в правильной директории
if [ ! -f "llm-bot.js" ]; then
    echo "❌ Please run this script from the llm_bot directory"
    exit 1
fi

# Настройка для локальной разработки
echo "📝 Setting up local development environment..."

# Создаем .env файл если его нет
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file from env.example..."
    cp env.example .env
fi

echo "✅ Local environment ready!"
echo ""
echo "🚀 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run: npm start"
echo "3. Test: npm run test:auto"
echo ""
echo "🌐 For production deployment:"
echo "1. Set secrets: supabase secrets set SUPABASE_URL=https://your-project.supabase.co"
echo "2. Set secrets: supabase secrets set LLM_BOT_URL=https://your-llm-bot.com/analyze"
echo "3. Deploy: supabase functions deploy llm-analysis"
