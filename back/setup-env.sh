#!/bin/bash

echo "🔧 Налаштування змінних середовища..."

# Створюємо .env файл
cat > .env << EOF
# SerpAPI Configuration
SERPAPI_API_KEY=your_serpapi_key_here

# Database Configuration
DATABASE_URL=sqlite:reactions.db

# Application Configuration
PORT=3000
NODE_ENV=development
EOF

echo "✅ Файл .env створено!"
echo ""
echo "📝 Налаштування SerpAPI:"
echo "1. Отримайте API ключ на https://serpapi.com"
echo "2. Відкрийте файл .env: nano .env"
echo "3. Замініть 'your_serpapi_key_here' на ваш справжній ключ"
echo "4. Збережіть файл (Ctrl+X, Y, Enter)"
echo ""
echo "🚀 Потім запустіть сервер: npm run start:dev"
