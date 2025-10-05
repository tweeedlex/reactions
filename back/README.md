# Reactions Backend

Універсальний Backend API для парсингу відгуків з різних джерел за допомогою сучасних API сервісів.

## Функціональність

- 🚀 **Універсальний парсинг** - один API для всіх джерел
- 🗺️ **Google Maps** - відгуки через serper.dev (основний) + SerpAPI (fallback)
- 📱 **Google Play Store** - відгуки через serper.dev + SerpAPI
- 🍎 **App Store** - відгуки через serper.dev + SerpAPI
- 🔍 **Google Search** - пошук відгуків через serper.dev
- 💾 **SQLite база даних** - зберігання всіх коментарів
- 🌐 **CORS підтримка** - для фронтенду
- ⚡ **Швидкий парсинг** - оптимізовані API виклики
- 🔄 **Fallback система** - автоматичне переключення між API

## Встановлення

1. Встановіть залежності:
```bash
npm install
```

2. Налаштуйте API ключі:
```bash
# Створіть файл .env в директорії back/
echo "SERPER_API_KEY=8cf14c1ad23cb13b1e5798e9750ac7734c991eb7" > .env
echo "SERPAPI_API_KEY=8cf14c1ad23cb13b1e5798e9750ac7734c991eb7" >> .env

# Опціонально: налаштуйте кількість відгуків для парсингу
echo "MAX_REVIEW_PAGES=20" >> .env  # Максимум 20 сторінок
echo "REVIEWS_PER_PAGE=8" >> .env   # 8 відгуків на сторінку
```

3. Запустіть додаток:
```bash
npm run start:dev
```

## Налаштування API

### 🚀 Швидкий старт
API ключі вже налаштовані! Система використовує:
- **serper.dev** як основний API (швидший, дешевший)
- **SerpAPI** як fallback (для складних випадків)

### 🔧 Налаштування ключів
```bash
# serper.dev (основний API)
SERPER_API_KEY=8cf14c1ad23cb13b1e5798e9750ac7734c991eb7

# SerpAPI (fallback)
SERPAPI_API_KEY=8cf14c1ad23cb13b1e5798e9750ac7734c991eb7
```

### 💡 Переваги нової системи
- **Швидше** - serper.dev працює швидше за SerpAPI
- **Надійніше** - автоматичний fallback при помилках
- **Універсальніше** - один API для всіх джерел

## Налаштування парсингу

### Кількість відгуків
За замовчуванням система парсить до **1600 відгуків** (200 сторінок × 8 відгуків на сторінку для Google Maps).

#### Змінні середовища:
- `MAX_REVIEW_PAGES` - максимальна кількість сторінок (за замовчуванням: 200)
- `REVIEWS_PER_PAGE` - кількість відгуків на сторінку (за замовчуванням: 8)
- `UNLIMITED_PAGES` - зняти всі обмеження (за замовчуванням: false)

#### Приклади налаштувань:
```bash
# Стандартне налаштування (1600 відгуків)
MAX_REVIEW_PAGES=200
REVIEWS_PER_PAGE=8

# Більше відгуків (3200 відгуків)
MAX_REVIEW_PAGES=400
REVIEWS_PER_PAGE=8

# Без обмежень (парсинг всіх доступних відгуків)
UNLIMITED_PAGES=true

# Швидший парсинг (80 відгуків)
MAX_REVIEW_PAGES=10
REVIEWS_PER_PAGE=8
```

**Примітка:** Збільшення кількості відгуків може призвести до:
- Більшого споживання API квот SerpAPI
- Довшого часу парсингу
- Більшого навантаження на базу даних

## API Endpoints

### 🚀 Універсальний парсинг (рекомендовано)
- `POST /universal-parsing/parse` - Універсальний парсинг всіх джерел
- `GET /universal-parsing/sources` - Список доступних джерел
- `POST /universal-parsing/google-maps` - Google Maps через serper.dev
- `POST /universal-parsing/google-play` - Google Play Store через serper.dev
- `POST /universal-parsing/app-store` - App Store через serper.dev
- `POST /universal-parsing/google-search` - Google Search через serper.dev

### 🔧 Serper.dev API
- `POST /serper/parse-universal` - Прямий виклик serper.dev
- `GET /serper/test-connection` - Перевірка підключення

### 📱 Класичний парсинг (legacy)
- `POST /parsing/parse` - Парсинг через SerpAPI
- `POST /google-maps/parse` - Google Maps через SerpAPI

### 💾 Коментарі
- `GET /comments` - Отримати всі коментарі
- `GET /comments?store=playstore` - Фільтр по магазину
- `GET /comments/app/:appId` - Коментарі конкретного додатку/місця
- `GET /comments/:id` - Окремий коментар
- `DELETE /comments/:id` - Видалити коментар

## Приклад використання

```bash
# 🚀 Універсальний парсинг (рекомендовано)
# Перевірка підключення
curl -X GET http://localhost:3000/serper/test-connection

# Список доступних джерел
curl -X GET http://localhost:3000/universal-parsing/sources

# Google Maps
curl -X POST http://localhost:3000/universal-parsing/google-maps \
  -H "Content-Type: application/json" \
  -d '{"placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4", "language": "uk"}'

# Google Play Store
curl -X POST http://localhost:3000/universal-parsing/google-play \
  -H "Content-Type: application/json" \
  -d '{"appId": "com.whatsapp", "language": "uk"}'

# App Store
curl -X POST http://localhost:3000/universal-parsing/app-store \
  -H "Content-Type: application/json" \
  -d '{"appId": "310633997", "language": "uk"}'

# Google Search
curl -X POST http://localhost:3000/universal-parsing/google-search \
  -H "Content-Type: application/json" \
  -d '{"query": "WhatsApp reviews", "language": "uk"}'

# 📱 Класичний парсинг (legacy)
curl -X POST http://localhost:3000/parsing/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://play.google.com/store/apps/details?id=com.whatsapp"}'
```

## Переваги нової системи

✅ **Універсальність** - один API для всіх джерел  
✅ **Швидкість** - serper.dev працює швидше за SerpAPI  
✅ **Надійність** - автоматичний fallback при помилках  
✅ **Простота** - єдиний інтерфейс для всіх джерел  
✅ **Масштабованість** - оптимізовані API виклики  
✅ **Гнучкість** - можна використовувати різні API  

## Модулі

- **UniversalParsingModule** - Універсальний парсинг всіх джерел
- **SerperModule** - Інтеграція з serper.dev API
- **SerpApiModule** - Fallback через SerpAPI
- **CommentsModule** - Управління коментарями в базі даних
- **ParsingModule** - Класичний парсинг (legacy)
- **GoogleMapsModule** - Класичний Google Maps (legacy)

## Тестування

```bash
# Демонстраційний тест
node test-demo.js

# Очищення бази даних
node clear-database.js
```

## Технології

- **NestJS** - Node.js фреймворк
- **TypeScript** - типізований JavaScript
- **SQLite** - легка база даних
- **serper.dev** - основний API для парсингу
- **SerpAPI** - fallback API
- **Axios** - HTTP клієнт
- **TypeORM** - ORM для роботи з БД
