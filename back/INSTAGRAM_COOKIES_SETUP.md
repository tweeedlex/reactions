# Налаштування Instagram Cookies для Apify

Для роботи з Instagram через Apify потрібні реальні cookies аутентифікації.

## Крок 1: Встановлення Cookie Editor

1. Відкрийте Chrome Web Store: https://chrome.google.com/webstore
2. Знайдіть "Cookie Editor" 
3. Натисніть "Додати в Chrome"

## Крок 2: Отримання Cookies

1. Відкрийте Instagram в браузері: https://www.instagram.com
2. Увійдіть в свій акаунт Instagram
3. Натисніть на іконку Cookie Editor в панелі браузера
4. Натисніть "Export" → "Export as JSON"
5. Скопіюйте JSON з cookies

## Крок 3: Оновлення коду

Замініть dummy cookies в `instagram-parsing.service.ts`:

```typescript
cookies: [
  {
    name: 'csrftoken',
    value: 'ВАШ_CSRFTOKEN_З_БРАУЗЕРА'
  },
  {
    name: 'sessionid', 
    value: 'ВАША_SESSIONID_З_БРАУЗЕРА'
  }
]
```

## Крок 4: Тестування

```bash
curl -X POST http://localhost:3000/instagram-parsing/parse \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://www.instagram.com/p/DI_rMo2CCTz"],"maxComments":5}'
```

## Важливо

- Cookies мають обмежений термін дії
- Потрібно оновлювати їх періодично
- Не ділитеся cookies з іншими
- Використовуйте тільки власні cookies

## Структура результатів

Actor повертає дані в форматі:

```json
{
  "post_url": "https://www.instagram.com/p/DI_rMo2CCTz/",
  "comments": [
    {
      "id": "18052175510201263",
      "text": "Comment text...",
      "created_at": 1746331257,
      "owner": "username",
      "likes": 0
    }
  ]
}
```
