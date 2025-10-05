# Отримання реальних Instagram cookies

## Крок 1: Встановлення Cookie Editor

1. Відкрийте Chrome Web Store: https://chrome.google.com/webstore
2. Знайдіть "Cookie Editor" 
3. Натисніть "Додати в Chrome"

## Крок 2: Отримання Cookies

1. Відкрийте Instagram в браузері: https://www.instagram.com
2. **Увійдіть в свій акаунт Instagram** (це важливо!)
3. Натисніть на іконку Cookie Editor в панелі браузера
4. Натисніть "Export" → "Export as JSON"
5. Скопіюйте JSON з cookies

## Крок 3: Знайдіть потрібні cookies

В експортованому JSON знайдіть ці cookies:
- `csrftoken` - токен CSRF
- `sessionid` - ID сесії

Приклад:
```json
{
  "name": "csrftoken",
  "value": "ваш_csrf_token_тут"
},
{
  "name": "sessionid", 
  "value": "ваш_session_id_тут"
}
```

## Крок 4: Оновлення коду

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

## Крок 5: Тестування

```bash
curl -X POST http://localhost:3000/instagram-parsing/parse \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://www.instagram.com/p/DI_rMo2CCTz"],"maxComments":5}'
```

## Важливо

- Cookies мають обмежений термін дії (зазвичай 1-7 днів)
- Потрібно оновлювати їх періодично
- Не ділитеся cookies з іншими
- Використовуйте тільки власні cookies
- Після входу в Instagram, cookies стають активними
