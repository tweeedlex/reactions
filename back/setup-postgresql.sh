#!/bin/bash

# Скрипт для налаштування PostgreSQL

echo "Налаштування PostgreSQL для проекту reactions..."

# Перевіряємо чи встановлений PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL не встановлений. Встановлюємо..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# Запускаємо PostgreSQL сервіс
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Створюємо базу даних
echo "Створюємо базу даних 'reactions'..."
sudo -u postgres createdb reactions 2>/dev/null || echo "База даних 'reactions' вже існує"

# Створюємо користувача (опціонально)
echo "Створюємо користувача 'reactions_user'..."
sudo -u postgres psql -c "CREATE USER reactions_user WITH PASSWORD 'reactions_password';" 2>/dev/null || echo "Користувач вже існує"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE reactions TO reactions_user;" 2>/dev/null || echo "Права вже надані"

echo "PostgreSQL налаштовано!"
echo "Тепер ви можете запустити міграції:"
echo "psql -h localhost -U postgres -d reactions -f migrations/001_create_sources_table.sql"
echo "psql -h localhost -U postgres -d reactions -f migrations/002_create_apps_table.sql"
echo "psql -h localhost -U postgres -d reactions -f migrations/003_create_reviews_table.sql"
echo "psql -h localhost -U postgres -d reactions -f migrations/004_insert_initial_sources.sql"
