# 🏗️ Архітектура проєкту BrandDefender

## 📁 Структура файлів

```
src/
├── components/          # Переісні UI компоненти
│   ├── dashboard/      # Компоненти для Dashboard
│   │   ├── MetricCard.tsx
│   │   ├── PriorityIssueCard.tsx
│   │   └── index.ts
│   ├── layout/         # Layout компоненти
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   └── support/        # Компоненти для Support
│       ├── CommentCard.tsx
│       ├── AlertCard.tsx
│       ├── ResponseConstructor.tsx
│       └── index.ts
├── pages/              # Сторінки застосунку
│   ├── HomePage.tsx
│   ├── Dashboard.tsx
│   ├── SupportPage.tsx
│   └── index.ts
├── types/              # TypeScript типи та інтерфейси
│   └── index.ts
├── utils/              # Утиліти та хелпери
│   ├── mockData.ts
│   └── responseTemplates.ts
├── assets/             # Статичні ресурси
├── App.tsx             # Головний компонент з роутингом
├── main.tsx            # Entry point
└── index.css           # Глобальні стилі
```

## 🎯 Принципи організації

### 1. **Компоненти** (`src/components/`)
- Розділені за функціональністю (dashboard, layout, support)
- Кожна папка має `index.ts` для barrel exports
- Переісні та тестовані компоненти

### 2. **Сторінки** (`src/pages/`)
- Кожна сторінка — окремий файл
- Використовують компоненти з `components/`
- Мінімальна бізнес-логіка (винесена в utils)

### 3. **Типи** (`src/types/`)
- Всі TypeScript інтерфейси в одному місці
- Експортуються через barrel `index.ts`
- Використовуються скрізь через `@/types`

### 4. **Утиліти** (`src/utils/`)
- Хелпери, константи, мок-дані
- Чисті функції без side-effects
- Легко тестуються

## 🔗 Path Aliases

Проєкт використовує `@/` alias для чистих імпортів:

```typescript
// ❌ Було
import { Comment } from '../../types';
import { mockData } from '../../../utils/mockData';

// ✅ Стало
import type { Comment } from '@/types';
import { mockData } from '@/utils/mockData';
```

Налаштовано в:
- `vite.config.ts` — для Vite bundler
- `tsconfig.app.json` — для TypeScript

## 📦 Barrel Exports

Кожна папка з компонентами має `index.ts`:

```typescript
// src/components/layout/index.ts
export { Navbar } from './Navbar';
export { Footer } from './Footer';

// Використання
import { Navbar, Footer } from '@/components/layout';
```

## 🎨 Компоненти

### Layout
- **Navbar** — навігація з мобільним меню
- **Footer** — підвал сайту

### Dashboard
- **MetricCard** — карточка метрики з іконкою та трендом
- **PriorityIssueCard** — карточка пріоритетної проблеми

### Support
- **CommentCard** — карточка коментаря з соцмереж
- **AlertCard** — карточка попередження
- **ResponseConstructor** — конструктор відповідей

## 🔄 Data Flow

```
mockData.ts (utils)
    ↓
Pages (Dashboard, Support)
    ↓
Components (MetricCard, CommentCard)
    ↓
UI Render
```

## 🚀 Розширення

### Додати новий компонент:
1. Створити файл у відповідній папці `components/`
2. Додати експорт в `index.ts`
3. Використати в сторінці через `@/components/...`

### Додати нову сторінку:
1. Створити файл у `pages/`
2. Додати експорт в `pages/index.ts`
3. Додати роут в `App.tsx`

### Додати новий тип:
1. Додати інтерфейс в `types/index.ts`
2. Використовувати через `import type { ... } from '@/types'`

## 📊 Переваги нової структури

✅ **Модульність** — кожен компонент незалежний  
✅ **Переісність** — компоненти легко використовувати повторно  
✅ **Типізація** — всі типи в одному місці  
✅ **Чисті імпорти** — завдяки path aliases  
✅ **Масштабованість** — легко додавати нові фічі  
✅ **Тестування** — компоненти та утиліти легко тестувати  

## 🛠️ Tech Stack

- **React 19** — UI фреймворк
- **TypeScript** — типізація
- **Vite** — bundler
- **TailwindCSS** — стилізація
- **React Router** — роутинг
- **Lucide React** — іконки
