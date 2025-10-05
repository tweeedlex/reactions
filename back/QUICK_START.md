# Швидкий старт з PostgreSQL

## Крок 1: Встановлення залежностей
```bash
cd back
npm install
```

## Крок 2: Налаштування PostgreSQL

### Автоматичне налаштування:
```bash
./setup-postgresql.sh
```

### Або вручну:
```bash
# Встановлення PostgreSQL (якщо не встановлений)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Запуск сервісу
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Створення бази даних
sudo -u postgres createdb reactions
```

## Крок 3: Запуск міграцій

### Автоматично:
```bash
./run-migrations.sh
```

### Або вручну:
```bash
psql -h localhost -U postgres -d reactions -f migrations/001_create_sources_table.sql
psql -h localhost -U postgres -d reactions -f migrations/002_create_apps_table.sql
psql -h localhost -U postgres -d reactions -f migrations/003_create_reviews_table.sql
psql -h localhost -U postgres -d reactions -f migrations/004_insert_initial_sources.sql
```

## Крок 4: Налаштування змінних середовища

Скопіюйте файл `postgresql-config.env` в `.env`:
```bash
cp postgresql-config.env .env
```

## Крок 5: Запуск додатку
```bash
npm run start:dev
```

## Крок 6: Міграція існуючих даних (опціонально)
```bash
node migrate-to-postgresql.js
```

## Перевірка роботи

Після запуску додатку перевірте API:

```bash
# Створення тестового відгуку
curl -X POST http://localhost:3000/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "google_play",
    "appId": "com.whatsapp",
    "appName": "WhatsApp",
    "author": "Test User",
    "rating": 5,
    "text": "Тестовий відгук",
    "source": "google_play"
  }'

# Отримання списку додатків
curl http://localhost:3000/apps

# Отримання відгуків
curl http://localhost:3000/reviews
```

## Структура API

### Відгуки:
- `POST /reviews` - створення відгуку
- `GET /reviews/app/:appId` - відгуки по додатку
- `GET /reviews/platform/:platform` - відгуки по платформі
- `GET /reviews/source/:source` - відгуки по джерелу
- `GET /reviews/stats/:appId` - статистика відгуків

### Додатки:
- `GET /apps` - список додатків
- `GET /apps/:id` - додаток по ID
- `GET /apps/platform/:platform/app/:appId` - додаток по платформі та ID
