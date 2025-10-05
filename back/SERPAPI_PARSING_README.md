# Парсери відгуків через SerpAPI

## 🚀 Огляд

Система парсингу відгуків з Google Play Store та Google Maps через SerpAPI з підтримкою української мови.

## 🔧 Налаштування

### API Ключ
```bash
# В .env файлі
SERPAPI_API_KEY=fda426065a3f31f282eac9271c52fd8eebfe6a5b858b1bc4db2f1bd40112a505
```

### Запуск сервера
```bash
cd back
npm run start:dev
```

## 📱 Google Play Store Парсинг

### Парсинг відгуків додатку
```bash
curl -X POST "http://localhost:3000/universal-parsing/google-play?appId=com.whatsapp&language=uk"
```

**Параметри:**
- `appId` - ID додатку (наприклад: com.whatsapp)
- `language` - мова (uk, en, ru)

**Приклад відповіді:**
```json
{
  "comments": [
    {
      "appId": "com.whatsapp",
      "appName": "WhatsApp Messenger",
      "store": "googlemaps",
      "content": "Дуже корисний додаток!",
      "author": "Користувач",
      "rating": 5,
      "reviewDate": "2025-10-05T01:51:27.000Z",
      "helpfulVotes": 0
    }
  ],
  "count": 1
}
```

## 🗺️ Google Maps Парсинг

### Пошук місця за назвою
```bash
curl -X POST "http://localhost:3000/universal-parsing/google-maps?placeId=ChIJL7avWDDP1EAROm_OQ1JlX9w&language=uk"
```

**Параметри:**
- `placeId` - Google Maps Place ID
- `language` - мова (uk, en, ru)

### Пошук Place ID за назвою
```bash
curl -X POST "http://localhost:3000/google-maps/parse" -H "Content-Type: application/json" -d '{"url": "https://maps.google.com/..."}'
```

## 🔍 Пошук місць

### Автоматичний пошук за назвою
Система автоматично шукає місця за різними варіантами назв:

```javascript
// Приклад пошуку для "Футбольна арена МАУП"
const searchQueries = [
  'Футбольна арена МАУП Київ',
  'МАУП Київ футбольна арена', 
  'МАУП Київ',
  'МАУП футбольна',
  'МАУП Київ спорт'
];
```

## ⚙️ Налаштування парсингу

### Змінні середовища
```bash
# Максимальна кількість сторінок (за замовчуванням: 50)
MAX_REVIEW_PAGES=50

# Кількість відгуків на сторінку (за замовчуванням: 8)
REVIEWS_PER_PAGE=8

# Без обмежень сторінок (за замовчуванням: false)
UNLIMITED_PAGES=false
```

### Захист від нескінченних циклів
- **Лічильник дублікатів**: зупинка при 20+ дублікатах поспіль
- **Порожні сторінки**: зупинка при 3+ порожніх сторінках поспіль
- **Максимальні сторінки**: обмеження на 50 сторінок за замовчуванням

## 📊 Доступні API Endpoints

### Основні endpoints
- `POST /universal-parsing/google-play` - Парсинг Google Play Store
- `POST /universal-parsing/google-maps` - Парсинг Google Maps
- `GET /parsing/test-serpapi` - Тест підключення до SerpAPI

### Додаткові endpoints
- `POST /parsing/parse` - Парсинг за URL додатку
- `GET /universal-parsing/sources` - Список доступних джерел
- `GET /universal-parsing/test-all-sources` - Тест всіх джерел

## 🛡️ Фільтрація відгуків

### Автоматична фільтрація
- Короткі відгуки (< 10 символів)
- Дублікати
- Спам та фейкові відгуки
- Системні повідомлення
- Відгуки з занадто багатьма спеціальними символами

### Валідація контенту
- Перевірка на HTML теги
- Перевірка на URL-адреси
- Перевірка на електронні пошти
- Перевірка на телефонні номери

## 📈 Статистика парсингу

### Логування
Всі операції парсингу логуються з детальною інформацією:
- Кількість оброблених сторінок
- Кількість знайдених відгуків
- Кількість відфільтрованих відгуків
- Час виконання операцій

### Моніторинг
- Відстеження дублікатів
- Відстеження порожніх сторінок
- Автоматична зупинка при проблемах

## 🔧 Налагодження

### Перевірка підключення
```bash
curl -X GET "http://localhost:3000/parsing/test-serpapi"
```

### Тест з простим запитом
```bash
curl -X GET "http://localhost:3000/"
```

### Логи сервера
```bash
# Перегляд логів в реальному часі
tail -f server.log
```

## 📝 Приклади використання

### 1. Парсинг WhatsApp відгуків
```bash
curl -X POST "http://localhost:3000/universal-parsing/google-play?appId=com.whatsapp&language=uk"
```

### 2. Парсинг відгуків МАУП
```bash
curl -X POST "http://localhost:3000/universal-parsing/google-maps?placeId=ChIJL7avWDDP1EAROm_OQ1JlX9w&language=uk"
```

### 3. Пошук місця за назвою
```bash
curl -X POST "http://localhost:3000/google-maps/parse" -H "Content-Type: application/json" -d '{"url": "https://maps.google.com/?q=МАУП+Київ"}'
```

## ⚠️ Обмеження

- **API ліміти**: SerpAPI має обмеження на кількість запитів
- **Швидкість**: Затримка 1 секунда між запитами
- **Дублікати**: Автоматична фільтрація дублікатів
- **Таймаути**: Максимальний час виконання 60 секунд

## 🆘 Вирішення проблем

### Проблема: "Invalid API key"
**Рішення**: Перевірте правильність API ключа в .env файлі

### Проблема: "Connection refused"
**Рішення**: Переконайтеся, що сервер запущений на порту 3000

### Проблема: Нескінченний цикл парсингу
**Рішення**: Система автоматично зупиняється при занадто багатьох дублікатах

### Проблема: Місце не знайдено
**Рішення**: Спробуйте різні варіанти назви місця

## 📞 Підтримка

Для отримання допомоги звертайтеся до логів сервера або перевірте налаштування API ключа.
