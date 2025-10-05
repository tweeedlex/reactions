# Міграція на PostgreSQL

## Огляд змін

Створено нову структуру бази даних PostgreSQL згідно з вимогами:

### Таблиці:
1. **sources** - джерела даних (Google Play, App Store, Facebook, Instagram)
2. **apps** - додатки з унікальним індексом (platform, app_id)
3. **reviews** - відгуки/коментарі з зв'язками до додатків

### Нові сервіси:
- `AppsService` - управління додатками
- `ReviewsService` - управління відгуками
- `SourcesService` - управління джерелами

### API ендпоінти:
- `POST /reviews` - створення відгуку
- `GET /reviews/app/:appId` - отримання відгуків по додатку
- `GET /reviews/platform/:platform` - отримання відгуків по платформі
- `GET /reviews/source/:source` - отримання відгуків по джерелу
- `GET /reviews/stats/:appId` - статистика відгуків
- `GET /apps` - список додатків
- `GET /apps/:id` - додаток по ID

## Встановлення

### 1. Встановіть PostgreSQL залежності:
```bash
npm install
```

### 2. Налаштуйте змінні середовища:
Створіть файл `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=reactions
NODE_ENV=development
```

### 3. Створіть базу даних PostgreSQL:
```sql
CREATE DATABASE reactions;
```

### 4. Запустіть міграції:
```bash
# Встановіть PostgreSQL та створіть базу даних
psql -h localhost -U postgres -d reactions -f migrations/001_create_sources_table.sql
psql -h localhost -U postgres -d reactions -f migrations/002_create_apps_table.sql
psql -h localhost -U postgres -d reactions -f migrations/003_create_reviews_table.sql
psql -h localhost -U postgres -d reactions -f migrations/004_insert_initial_sources.sql
```

### 5. Міграція існуючих даних (опціонально):
```bash
node migrate-to-postgresql.js
```

### 6. Запустіть додаток:
```bash
npm run start:dev
```

## Використання API

### Створення відгуку:
```bash
curl -X POST http://localhost:3000/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "google_play",
    "appId": "com.whatsapp",
    "appName": "WhatsApp",
    "author": "John Doe",
    "rating": 5,
    "text": "Відмінний додаток!",
    "source": "google_play",
    "category": "Messenger"
  }'
```

### Отримання відгуків по додатку:
```bash
curl http://localhost:3000/reviews/app/{app-id}?limit=10&offset=0
```

### Статистика відгуків:
```bash
curl http://localhost:3000/reviews/stats/{app-id}
```

## Структура даних

### Apps (Додатки):
- `id` - UUID первинний ключ
- `platform` - платформа (google_play, app_store, facebook, instagram)
- `app_id` - ідентифікатор додатку на платформі
- `name` - назва додатку
- `category` - категорія додатку
- `created_at`, `updated_at` - дати створення та оновлення

### Reviews (Відгуки):
- `id` - UUID первинний ключ
- `app_id` - зв'язок з додатком
- `author` - автор відгуку
- `rating` - оцінка (1-5)
- `text` - текст відгуку
- `source` - джерело відгуку
- `review_id` - ідентифікатор відгуку на платформі
- `date` - дата публікації
- `helpful` - кількість корисних голосів
- `created_at`, `updated_at` - дати створення та оновлення

### Sources (Джерела):
- `id` - UUID первинний ключ
- `name` - назва джерела
- `api_key` - API ключ (якщо потрібно)
- `created_at`, `updated_at` - дати створення та оновлення

## Індекси та оптимізація

Створено наступні індекси для покращення продуктивності:
- Унікальний індекс `(platform, app_id)` для apps
- Унікальний індекс `(source, review_id)` для reviews
- Індекс `(app_id, date)` для швидкого пошуку відгуків по даті
- Додаткові індекси для часто використовуваних полів

## Міграція з SQLite

Скрипт `migrate-to-postgresql.js` автоматично:
1. Читає дані з існуючої SQLite бази
2. Конвертує формат даних для нової структури
3. Створює додатки та відгуки в PostgreSQL
4. Запобігає дублюванню даних
