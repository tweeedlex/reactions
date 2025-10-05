# Модуль Пріоритизації Відгуків

Модуль для автоматичного розрахунку пріоритету відгуків на основі тональності, впливу та свіжості.

## 🎯 Функціональність

- **Автоматичний розрахунок пріоритету** відгуків на основі трьох факторів
- **Сортування за пріоритетом** (high → medium → low)
- **Фільтрація та пагінація** результатів
- **Статистика пріоритетів** для аналітики

## 📊 Алгоритм Пріоритизації

### Фактори Оцінки

| Фактор | Вага | Правила | Бали |
|--------|------|---------|------|
| **Тональність** | 3 | negative → 3, neutral → 2, positive → 1 | sentimentScore |
| **Вплив/лайки** | 3 | >50 → 3, 10–50 → 2, 1–9 → 1, 0 → 0 | likesScore |
| **Свіжість** | 3 | <7 днів → 3, 7–30 днів → 2, >30 днів → 1 | recencyScore |

### Формула Загальної Оцінки

```
totalScore = sentimentScore + likesScore + recencyScore
```

### Категорії Пріоритету

- **high** → totalScore ≥ 7
- **medium** → totalScore 5–6  
- **low** → totalScore < 5

## 🚀 API Ендпоінти

### GET /feedbacks/prioritized

Отримує пріоритизовані відгуки.

**Параметри запиту:**
- `status` (string, optional) - фільтр за статусом
- `limit` (number, optional) - кількість результатів (1-1000)
- `offset` (number, optional) - зміщення для пагінації
- `source` (string, optional) - фільтр за джерелом
- `appId` (number, optional) - фільтр за ID додатку

**Приклад запиту:**
```bash
GET /feedbacks/prioritized?limit=10&source=Google Maps
```

**Відповідь:**
```json
[
  {
    "id": "123",
    "text": "Дуже довго чекали замовлення, але товар чудовий.",
    "date": "2025-01-15T14:22:00Z",
    "source": "Google Maps",
    "author": "Ivan K.",
    "likes": 12,
    "sentiment": "negative",
    "category": "доставка",
    "priority": "high",
    "status": "Запит",
    "totalScore": 8,
    "sentimentScore": 3,
    "likesScore": 2,
    "recencyScore": 3
  }
]
```

### GET /feedbacks/prioritized/stats

Отримує статистику пріоритетів.

**Параметри запиту:**
- `status` (string, optional) - фільтр за статусом
- `source` (string, optional) - фільтр за джерелом
- `appId` (number, optional) - фільтр за ID додатку

**Відповідь:**
```json
{
  "total": 150,
  "high": 25,
  "medium": 80,
  "low": 45
}
```

## 🏗️ Структура Модуля

```
src/priority/
├── priority.service.ts    # Логіка розрахунку пріоритету
├── priority.controller.ts # API ендпоінти
└── priority.module.ts    # Конфігурація модуля
```

## 🔧 Встановлення

Модуль автоматично підключається до `app.module.ts`:

```typescript
import { PriorityModule } from './priority/priority.module';

@Module({
  imports: [
    // ... інші модулі
    PriorityModule,
  ],
})
export class AppModule {}
```

## 🧪 Тестування

Запустіть тестовий скрипт:

```bash
node test-priority.js
```

Тест перевіряє:
- ✅ Отримання пріоритизованих відгуків
- ✅ Статистику пріоритетів
- ✅ Фільтрацію за параметрами
- ✅ Структуру відповіді
- ✅ Валідність даних

## 📈 Приклад Використання

### 1. Отримання Високопріоритетних Відгуків

```bash
curl "http://localhost:3000/feedbacks/prioritized?limit=5"
```

### 2. Фільтрація за Джерелом

```bash
curl "http://localhost:3000/feedbacks/prioritized?source=Google Maps&limit=10"
```

### 3. Статистика по Додатку

```bash
curl "http://localhost:3000/feedbacks/prioritized/stats?appId=123"
```

## 🎨 Kanban Доска

Модуль підготовлений для інтеграції з Kanban-дошкою:

- **Запит** → Відгуки зі статусом "Запит"
- **Вирішення** → Відгуки в процесі обробки  
- **Готово** → Оброблені відгуки

## 🔍 Детальна Логіка

### Розрахунок Тональності

```typescript
// На основі рейтингу (1-5 зірок)
if (rating <= 2) return 3;      // negative
else if (rating <= 3) return 2; // neutral  
else return 1;                   // positive
```

### Розрахунок Впливу

```typescript
// На основі кількості лайків
if (likes > 50) return 3;
else if (likes >= 10) return 2;
else if (likes >= 1) return 1;
else return 0;
```

### Розрахунок Свіжості

```typescript
// На основі віку відгуку
const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
if (diffDays < 7) return 3;      // <7 днів
else if (diffDays <= 30) return 2; // 7-30 днів
else return 1;                    // >30 днів
```

## 🚨 Обробка Помилок

- **400 Bad Request** - невалідні параметри
- **500 Internal Server Error** - помилки сервера
- **Логування** - детальні логи для діагностики

## 📝 Логи

Модуль веде детальні логи:
- Кількість знайдених відгуків
- Параметри фільтрації
- Статистика пріоритетів
- Помилки та попередження
