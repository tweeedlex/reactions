#!/bin/bash

# Скрипт для запуску міграцій PostgreSQL

echo "Запуск міграцій PostgreSQL..."

# Перевіряємо чи існує база даних
if ! psql -h localhost -U postgres -d reactions -c "SELECT 1;" &> /dev/null; then
    echo "База даних 'reactions' не існує. Створюємо..."
    sudo -u postgres createdb reactions
fi

# Запускаємо міграції
echo "Запускаємо міграцію 001_create_sources_table.sql..."
psql -h localhost -U postgres -d reactions -f migrations/001_create_sources_table.sql

echo "Запускаємо міграцію 002_create_apps_table.sql..."
psql -h localhost -U postgres -d reactions -f migrations/002_create_apps_table.sql

echo "Запускаємо міграцію 003_create_reviews_table.sql..."
psql -h localhost -U postgres -d reactions -f migrations/003_create_reviews_table.sql

echo "Запускаємо міграцію 004_insert_initial_sources.sql..."
psql -h localhost -U postgres -d reactions -f migrations/004_insert_initial_sources.sql

echo "Міграції завершено!"
echo "Тепер ви можете запустити додаток: npm run start:dev"
