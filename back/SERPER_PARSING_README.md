# Парсинг відгуків через serper.dev

Цей модуль дозволяє парсити відгуки з різних джерел через serper.dev API.

## Налаштування

1. Встановіть API ключ serper.dev в змінну середовища:
   ```bash
   export SERPER_API_KEY=37843c7b4f2d2571cb4db43512a5340041856528
   ```

2. Або створіть .env файл:
   ```
   SERPER_API_KEY=37843c7b4f2d2571cb4db43512a5340041856528
   ```

## API Endpoints

### 1. Парсинг по URL (Рекомендований)

**POST** `/url-parsing/parse`
```json
{
  "url": "https://maps.google.com/maps/place/...",
  "language": "uk",
  "sortBy": "newest"
}
```

**GET** `/url-parsing/parse?url=https://maps.google.com/maps/place/...&language=uk&sortBy=newest`

### 2. Парсинг Google Maps

**GET** `/serper-parsing/google-maps?placeId=ChIJ...&language=uk&sortBy=newest`

### 3. Парсинг Google Play Store

**GET** `/serper-parsing/google-play?appId=com.example.app&language=uk`

### 4. Парсинг App Store

**GET** `/serper-parsing/app-store?appId=123456789&language=uk`

### 5. Парсинг через Google Search

**GET** `/serper-parsing/google-search?query=назва+додатку&language=uk`

## Підтримувані URL формати

### Google Maps
- `https://maps.google.com/maps/place/...`
- `https://www.google.com/maps/place/...`
- `https://maps.google.com/?cid=ChIJ...`
- `https://maps.google.com/?place_id=ChIJ...`

### Google Play Store
- `https://play.google.com/store/apps/details?id=com.example.app`
- `https://play.google.com/store/apps/details/com.example.app`

### App Store
- `https://apps.apple.com/app/id123456789`
- `https://apps.apple.com/app/app-name/id123456789`

### Google Search
- `https://www.google.com/search?q=назва+додатку`
- `https://www.google.com.ua/search?q=назва+додатку`

## Приклади використання

### 1. Парсинг Google Maps відгуків
```bash
curl -X POST "http://localhost:3000/url-parsing/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://maps.google.com/maps/place/Ресторан+Україна/@50.4501,30.5234,17z",
    "language": "uk",
    "sortBy": "newest"
  }'
```

### 2. Парсинг Google Play Store відгуків
```bash
curl -X POST "http://localhost:3000/url-parsing/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://play.google.com/store/apps/details?id=com.whatsapp",
    "language": "uk"
  }'
```

### 3. Парсинг App Store відгуків
```bash
curl -X POST "http://localhost:3000/url-parsing/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://apps.apple.com/app/whatsapp-messenger/id310633997",
    "language": "uk"
  }'
```

### 4. Парсинг через Google Search
```bash
curl -X POST "http://localhost:3000/url-parsing/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com/search?q=whatsapp+reviews",
    "language": "uk"
  }'
```

## Тестування підключення

```bash
curl -X GET "http://localhost:3000/url-parsing/test-connection"
```

## Відповідь API

```json
{
  "comments": [
    {
      "appId": "ChIJ...",
      "appName": "Назва місця/додатку",
      "store": "googlemaps",
      "content": "Текст відгуку",
      "author": "Ім'я автора",
      "rating": 5,
      "reviewDate": "2024-01-01T00:00:00.000Z",
      "helpfulVotes": 0
    }
  ],
  "count": 1,
  "type": "google_maps",
  "identifier": "ChIJ...",
  "success": true,
  "message": "Парсинг завершено успішно. Напарсено 1 коментарів"
}
```

## Особливості

1. **Автоматичне визначення типу**: Система автоматично визначає тип URL (Google Maps, Google Play, App Store, Google Search)
2. **Збереження в БД**: Всі спарсені коментарі автоматично зберігаються в базу даних
3. **Фільтрація дублікатів**: Система автоматично фільтрує дублікати коментарів
4. **Підтримка мов**: Підтримується українська та інші мови
5. **Сортування**: Підтримується сортування за датою, рейтингом тощо

## Обмеження

1. **API ліміти**: serper.dev має ліміти на кількість запитів
2. **Підтримувані джерела**: Тільки Google Maps, Google Play Store, App Store та Google Search
3. **Мова**: За замовчуванням використовується українська мова

## Налагодження

Для налагодження перевірте логи сервера:
```bash
npm run start:dev
```

Логи покажуть детальну інформацію про процес парсингу та можливі помилки.
