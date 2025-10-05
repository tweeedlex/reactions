# Налаштування Google Maps Парсингу

## Огляд

Модуль Google Maps дозволяє парсити відгуки з Google Maps за посиланням, використовуючи той же SerpAPI сервіс, що і для Play Market та App Store.

## Швидкий старт

### 1. Встановлення залежностей

```bash
cd back
npm install
```

### 2. Налаштування SerpAPI

1. Отримайте API ключ з [SerpAPI](https://serpapi.com/)
2. Створіть `.env` файл в папці `back/`:
```bash
SERPAPI_API_KEY=your_actual_api_key_here
```

### 3. Запуск сервера

```bash
npm run start:dev
```

### 4. Тестування

```bash
node test-google-maps.js
```

## Використання API

### Парсинг Google Maps відгуків

```bash
curl -X POST http://localhost:3000/google-maps/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com/maps/place/Starbucks/@40.7128,-74.0060,17z/data=!3m1!4b1!4m6!3m5!1s0x89c25a21e3e9d0bb:0x93dba1773beee813!8m2!3d40.7128!4d-74.0060!16s%2Fg%2F11c0w8r0zr"}'
```

### Перевірка підключення

```bash
curl http://localhost:3000/google-maps/test-serpapi
```

## Підтримувані URL формати

1. **Стандартний Google Maps URL:**
   ```
   https://www.google.com/maps/place/Place+Name/@lat,lng,zoom/data=!3m1!4b1!4m6!3m5!1s0x1234567890abcdef:0x1234567890abcdef!8m2!3d40.7128!4d-74.0060!16s%2Fg%2F11abc123def
   ```

2. **URL з CID:**
   ```
   https://maps.google.com/maps?cid=1234567890123456789
   ```

3. **Короткі посилання:**
   ```
   https://goo.gl/maps/abc123def456
   https://maps.app.goo.gl/abc123def456
   ```

## Frontend інтеграція

Frontend автоматично визначає тип URL і використовує відповідний API ендпоінт:

- Google Play Store → `/parsing/parse`
- App Store → `/parsing/parse`  
- Google Maps → `/google-maps/parse`

## Структура даних

Відгуки зберігаються в тій же таблиці `comments` з додатковим полем `store`:

```json
{
  "id": 1,
  "appId": "0x1234567890abcdef:0x1234567890abcdef",
  "appName": "Starbucks",
  "store": "googlemaps",
  "content": "Чудове місце для роботи!",
  "author": "Іван Петренко",
  "rating": 5,
  "reviewDate": "2024-01-15T10:30:00.000Z",
  "helpfulVotes": 3,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## Обмеження

- Максимум 100 відгуків за один запит
- Затримка 1 секунда між сторінками
- Потребує валідний SerpAPI ключ
- Підтримує тільки публічні відгуки

## Налагодження

### Логи сервера

```bash
npm run start:dev
```

### Перевірка бази даних

```bash
sqlite3 reactions.db "SELECT * FROM comments WHERE store = 'googlemaps' LIMIT 5;"
```

### Тестування з різними URL

```bash
# Тест 1: Стандартний URL
node -e "
const axios = require('axios');
axios.post('http://localhost:3000/google-maps/parse', {
  url: 'https://www.google.com/maps/place/Starbucks/@40.7128,-74.0060,17z'
}).then(r => console.log(r.data));
"

# Тест 2: URL з CID
node -e "
const axios = require('axios');
axios.post('http://localhost:3000/google-maps/parse', {
  url: 'https://maps.google.com/maps?cid=1234567890123456789'
}).then(r => console.log(r.data));
"
```

## Усунення проблем

### Помилка "SERPAPI_API_KEY не встановлено"
- Перевірте наявність `.env` файлу
- Переконайтеся, що ключ встановлено правильно
- Перезапустіть сервер

### Помилка "Не вдалося витягти Place ID"
- Перевірте формат URL
- Спробуйте інший формат посилання
- Переконайтеся, що це публічне місце

### Помилка "SerpAPI не знайшов відгуків"
- Перевірте валідність API ключа
- Переконайтеся, що місце має відгуки
- Спробуйте інше місце для тестування
