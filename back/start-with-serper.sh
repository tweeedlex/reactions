#!/bin/bash

echo "🚀 Запуск сервера з serper.dev API ключем..."

# Встановлюємо змінну середовища
export SERPER_API_KEY=37843c7b4f2d2571cb4db43512a5340041856528

# Запускаємо сервер
echo "🔧 API ключ встановлено: $SERPER_API_KEY"
echo "🌐 Запуск сервера на порту 3000..."

npm run start:dev
