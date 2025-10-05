# 🔍 Діагностика Kanban Проблем

## 🚨 Проблема: Білий екран на frontend

### 📋 Кроки діагностики:

#### 1. Перевірте сервери
```bash
# Backend
curl http://localhost:3000/feedbacks/prioritized

# Frontend
curl http://localhost:5173
```

#### 2. Відкрийте тестові сторінки
- **Простий HTML тест**: http://localhost:5173/test-simple.html
- **React тест**: http://localhost:5173/test-kanban
- **Повний Kanban**: http://localhost:5173/kanban

#### 3. Перевірте консоль браузера
- Відкрийте F12 → Console
- Шукайте JavaScript помилки
- Перевірте Network tab для API запитів

## 🛠️ Можливі рішення:

### 1. Очистіть кеш
```bash
# Frontend
cd frontend
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### 2. Перевірте залежності
```bash
cd frontend
npm list @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 3. Перезапустіть сервери
```bash
# Backend
cd back
npm run start:dev

# Frontend
cd frontend  
npm run dev
```

## 🧪 Тестові сторінки:

### 1. HTML тест (без React)
- **URL**: http://localhost:5173/test-simple.html
- **Функція**: Простий JavaScript тест API
- **Переваги**: Швидкий, без залежностей

### 2. React тест (спрощений)
- **URL**: http://localhost:5173/test-kanban
- **Функція**: Спрощений React компонент
- **Переваги**: Без drag & drop, тільки відображення

### 3. Повний Kanban
- **URL**: http://localhost:5173/kanban
- **Функція**: Повний функціонал з drag & drop
- **Переваги**: Повна функціональність

## 🔍 Діагностичні кроки:

### Крок 1: Перевірте API
```bash
curl -s http://localhost:3000/feedbacks/prioritized | head -c 200
```
**Очікуваний результат**: JSON з відгуками

### Крок 2: Перевірте Frontend
```bash
curl -s http://localhost:5173 | head -c 200
```
**Очікуваний результат**: HTML сторінка

### Крок 3: Відкрийте тестові сторінки
1. **test-simple.html** - має показати Kanban без React
2. **test-kanban** - має показати спрощений React компонент
3. **kanban** - має показати повний Kanban

### Крок 4: Перевірте консоль
- F12 → Console
- Шукайте помилки JavaScript
- Перевірте Network tab

## 🚨 Часті проблеми:

### 1. CORS помилки
- **Симптом**: Помилки в консолі про CORS
- **Рішення**: Перевірте чи backend запущений

### 2. JavaScript помилки
- **Симптом**: Помилки в консолі
- **Рішення**: Перевірте синтаксис компонентів

### 3. Модулі не знайдені
- **Симптом**: "Module not found" помилки
- **Рішення**: Перевірте імпорти та залежності

### 4. Білий екран
- **Симптом**: Сторінка завантажується, але біла
- **Рішення**: Перевірте JavaScript помилки в консолі

## 📞 Підтримка:

### Логи для діагностики:
```bash
# Backend логи
cd back && npm run start:dev

# Frontend логи
cd frontend && npm run dev
```

### Перевірка статусу:
- **Backend**: http://localhost:3000/feedbacks/prioritized
- **Frontend**: http://localhost:5173
- **Тест HTML**: http://localhost:5173/test-simple.html
- **Тест React**: http://localhost:5173/test-kanban
- **Kanban**: http://localhost:5173/kanban
