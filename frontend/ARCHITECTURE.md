# 🏗️ Архітектура проєкту BrandDefender

## 📁 Структура файлів

```
src/
├── components/          # Переісні UI компоненти
│   ├── dashboard/      # Компоненти для Dashboard
│   │   ├── MetricCard.tsx
│   │   ├── PriorityIssueCard.tsx
│   │   ├── FilterEditModal.tsx
│   │   └── index.ts
│   ├── layout/         # Layout компоненти
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   ├── support/        # Компоненти для Support
│   │   ├── CommentCard.tsx
│   │   ├── AlertCard.tsx
│   │   ├── ResponseConstructor.tsx
│   │   ├── KeywordAlerts.tsx
│   │   └── index.ts
│   ├── SetupSourceModal.tsx  # Модальне вікно налаштування джерел
│   └── ProtectedRoute.tsx    # Захищений роут
├── contexts/           # React контексти
│   └── AuthContext.tsx      # Контекст авторизації
├── pages/              # Сторінки застосунку
│   ├── HomePage.tsx
│   ├── AuthPage.tsx
│   ├── BrandSetupPage.tsx
│   ├── Dashboard.tsx
│   ├── SupportPage.tsx
│   ├── SubscriptionPage.tsx
│   └── index.ts
├── types/              # TypeScript типи та інтерфейси
│   └── index.ts
├── utils/              # Утиліти та хелпери
│   ├── mockData.ts
│   ├── responseTemplates.ts
│   ├── localStorage.ts
│   └── supabase.ts
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
- Модальні вікна та захищені роути

### 2. **Контексти** (`src/contexts/`)
- React контексти для глобального стану
- AuthContext для управління авторизацією
- Провайдери для ін'єкції залежностей

### 3. **Сторінки** (`src/pages/`)
- Кожна сторінка — окремий файл
- Використовують компоненти з `components/`
- Мінімальна бізнес-логіка (винесена в utils)
- Захищені роутами через ProtectedRoute

### 4. **Типи** (`src/types/`)
- Всі TypeScript інтерфейси в одному місці
- Експортуються через barrel `index.ts`
- Використовуються скрізь через `@/types`
- Типи для авторизації, підписки, коментарів

### 5. **Утиліти** (`src/utils/`)
- Хелпери, константи, мок-дані
- Чисті функції без side-effects
- Легко тестуються
- localStorage управління
- Supabase інтеграція

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
- **Navbar** — навігація з мобільним меню та авторизацією
- **Footer** — підвал сайту

### Dashboard
- **MetricCard** — карточка метрики з іконкою та трендом
- **PriorityIssueCard** — карточка пріоритетної проблеми
- **FilterEditModal** — модальне вікно редагування фільтрів

### Support
- **CommentCard** — карточка коментаря з соцмереж
- **AlertCard** — карточка попередження
- **ResponseConstructor** — конструктор відповідей
- **KeywordAlerts** — слайдер алертів по ключових словах

### Auth & Setup
- **SetupSourceModal** — модальне вікно налаштування джерел
- **ProtectedRoute** — захищений роут з перевіркою авторизації

## 🔄 Data Flow

```
AuthContext (Supabase)
    ↓
localStorage (utils)
    ↓
Pages (Dashboard, Support, Subscription)
    ↓
Components (MetricCard, CommentCard, KeywordAlerts)
    ↓
UI Render
```

## 🔐 Авторизація

### AuthContext
- Управління станом авторизації через Supabase
- Методи: `signUp`, `signIn`, `signOut`, `updateProfile`
- Автоматичне збереження даних користувача в localStorage
- Слухач змін авторизації

### ProtectedRoute
- Перевірка авторизації перед доступом до сторінок
- Перенаправлення на `/auth` для неавторизованих
- Перенаправлення на `/setup` для неонборджених
- Індикатор завантаження

## 💾 Управління даними

### localStorage
- `saveUserData()` — збереження даних користувача
- `getUserData()` — отримання даних користувача
- `updateBrandFilters()` — оновлення фільтрів бренду
- `updateSubscription()` — оновлення підписки
- `toggleParsing()` — перемикання парсингу

### Supabase
- Авторизація користувачів
- Збереження профілю
- Синхронізація з localStorage

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
- **Supabase** — авторизація та backend
- **localStorage** — локальне збереження даних

## 📱 Сторінки та функціональність

### HomePage (`/`)
- Лендінг сторінка з інформацією про продукт
- Навігація до авторизації

### AuthPage (`/auth`)
- Реєстрація та вхід через Supabase
- Валідація форм
- Перемикання між режимами

### BrandSetupPage (`/setup`)
- 3-крокове налаштування бренду
- Назва бренду, ключові слова, джерела
- Модальні вікна для налаштування посилань

### Dashboard (`/dashboard`)
- Основна панель з метриками
- Графіки та статистика
- Редагування фільтрів

### SupportPage (`/support`)
- Система раннього попередження
- Алерти по ключових словах зі слайдером
- Коментарі з соцмереж
- Конструктор відповідей

### SubscriptionPage (`/subscription`)
- Управління підпискою
- Статус парсингу з toggle
- Тарифні плани
- Статистика використання

## 🔧 Налаштування

### Змінні середовища
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Path Aliases
- `@/` — src/
- `@/components` — src/components/
- `@/pages` — src/pages/
- `@/types` — src/types/
- `@/utils` — src/utils/
- `@/contexts` — src/contexts/
