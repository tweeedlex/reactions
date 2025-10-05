# PostgreSQL Setup

## Налаштування змінних середовища

Створіть файл `.env` в корені проекту з наступним вмістом:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=reactions

# Application Environment
NODE_ENV=development

# API Keys (if needed)
SERPAPI_KEY=your_serpapi_key_here
SERPER_API_KEY=your_serper_api_key_here
```

## Встановлення PostgreSQL

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### macOS (з Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

### Windows:
Завантажте з офіційного сайту: https://www.postgresql.org/download/windows/

## Створення бази даних

```sql
-- Підключіться до PostgreSQL як суперкористувач
sudo -u postgres psql

-- Створіть базу даних
CREATE DATABASE reactions;

-- Створіть користувача (опціонально)
CREATE USER reactions_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE reactions TO reactions_user;
```

## Запуск міграцій

```bash
# Встановіть залежності
npm install

# Запустіть міграції
psql -h localhost -U postgres -d reactions -f migrations/001_create_sources_table.sql
psql -h localhost -U postgres -d reactions -f migrations/002_create_apps_table.sql
psql -h localhost -U postgres -d reactions -f migrations/003_create_reviews_table.sql
psql -h localhost -U postgres -d reactions -f migrations/004_insert_initial_sources.sql
```

## Запуск додатку

```bash
npm run start:dev
```
