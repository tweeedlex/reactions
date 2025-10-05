# Instagram Парсинг Модуль

Цей модуль дозволяє парсити коментарі з Instagram постів через Apify API.

## Налаштування

### 1. Встановлення залежностей

```bash
npm install apify-client
```

### 2. Налаштування змінних середовища

Виконайте скрипт для додавання змінних середовища:

```bash
chmod +x setup-env-instagram.sh
./setup-env-instagram.sh
```

Або додайте вручну в `.env` файл:

```
APIFY_API_TOKEN=apify_api_AOs1ufgCUzb2oLmuAjzEW1qiBhqQRW3jMEha
```

### 3. Перезапуск сервера

```bash
npm run start:dev
```

## API Ендпоінти

### POST /instagram-parsing/parse
Парсить коментарі з Instagram постів.

**Тіло запиту:**
```json
{
  "urls": [
    "https://www.instagram.com/p/DI_rMo2CCTz"
  ],
  "maxComments": 100,
  "useApifyProxy": true
}
```

**Параметри:**
- `urls` (string[]): Масив URL Instagram постів
- `maxComments` (number, опціонально): Максимальна кількість коментарів (1-1000, за замовчуванням 100)
- `useApifyProxy` (boolean, опціонально): Використовувати Apify проксі (за замовчуванням true)

### GET /instagram-parsing/comments
Отримує всі збережені Instagram коментарі.

### GET /instagram-parsing/comments/by-url?url={postUrl}
Отримує коментарі для конкретного Instagram поста.

### DELETE /instagram-parsing/comments/by-url?url={postUrl}
Видаляє всі коментарі для конкретного Instagram поста.

## Структура даних

### InstagramComment Entity

```typescript
{
  id: number;
  postUrl: string;
  commentId: string;
  text: string;
  authorUsername: string;
  authorFullName: string;
  authorProfilePictureUrl?: string;
  likesCount: number;
  timestamp: string;
  parentCommentId?: string;
  isReply: boolean;
  createdAt: Date;
}
```

## Тестування

Запустіть тестовий скрипт:

```bash
node test-instagram-parsing.js
```

## Приклад використання

```javascript
const axios = require('axios');

// Парсинг коментарів
const response = await axios.post('http://localhost:3000/instagram-parsing/parse', {
  urls: ['https://www.instagram.com/p/DI_rMo2CCTz'],
  maxComments: 50
});

console.log('Збережено коментарів:', response.data.length);
```

## Особливості

- Автоматичне збереження коментарів в SQLite базу даних
- Підтримка основних коментарів та відповідей
- Використання Apify проксі для обходу обмежень Instagram
- Валідація вхідних даних
- Логування процесу парсингу
- Можливість отримання коментарів за URL поста

## Обмеження

- Максимальна кількість коментарів: 1000
- Залежність від Apify API та їх обмежень
- Можливі обмеження Instagram на кількість запитів
