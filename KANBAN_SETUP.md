# 🚀 Швидкий Запуск Kanban Дошки

## 📋 Передумови

- Node.js 18+ 
- npm або yarn
- Backend API (порт 3000)
- Frontend (порт 5173)

## 🔧 Встановлення

### 1. Backend (API)
```bash
cd back
npm install
npm run start:dev
```

### 2. Frontend (React)
```bash
cd frontend  
npm install
npm run dev
```

## 🧪 Тестування

### API Тести
```bash
cd back
node test-kanban-api.js
```

### Frontend Тести
```bash
cd frontend
npm run dev
# Відкрийте http://localhost:5173/kanban
```

## 🌐 Доступ

- **Frontend**: http://localhost:5173/kanban
- **API**: http://localhost:3000/feedbacks/prioritized
- **Тестова сторінка**: frontend/test-kanban.html

## 📊 Функціональність

### ✅ Що працює
- Пріоритизація відгуків
- Drag & Drop між стовпцями
- Фільтрація за параметрами
- Статистика в реальному часі
- Адаптивний дизайн

### 🎯 Стовпці Kanban
- **Запит** - нові відгуки
- **Вирішення** - в обробці  
- **Готово** - завершені

### 🎨 Візуальні індикатори
- **Пріоритет**: червоний (високий), жовтий (середній), сірий (низький)
- **Тональність**: зелений (позитивний), жовтий (нейтральний), червоний (негативний)

## 🔍 Troubleshooting

### Проблеми з API
```bash
# Перевірте чи запущений backend
curl http://localhost:3000/feedbacks/prioritized

# Перевірте логи
cd back && npm run start:dev
```

### Проблеми з Frontend
```bash
# Перевірте залежності
cd frontend && npm list @dnd-kit/core

# Перевстановіть якщо потрібно
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Проблеми з Drag & Drop
- Переконайтеся що @dnd-kit встановлені
- Перевірте браузер (підтримка HTML5)
- Очистіть кеш браузера

## 📱 Мобільна версія

- Адаптивний дизайн
- Touch-friendly drag & drop
- Оптимізовані фільтри

## 🎯 Наступні кроки

1. **Запустіть backend**: `cd back && npm run start:dev`
2. **Запустіть frontend**: `cd frontend && npm run dev`  
3. **Відкрийте**: http://localhost:5173/kanban
4. **Тестуйте**: перетягуйте картки між стовпцями

## 📞 Підтримка

- **Логи**: Developer Tools (F12)
- **API**: http://localhost:3000/feedbacks/prioritized
- **Документація**: frontend/KANBAN_README.md
