# BrandDefender Frontend

Фронтенд для системи моніторингу репутації бренду з авторизацією через Supabase.

## Технології

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Supabase (авторизація)
- React Router
- Lucide React (іконки)

## Налаштування

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Налаштування Supabase

1. Створіть проект в [Supabase](https://supabase.com)
2. Отримайте URL проекту та anon key
3. Створіть файл `.env.local` в корені проекту:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Запуск проекту

```bash
npm run dev
```

## Функціональність

### Авторизація
- ✅ Реєстрація користувачів
- ✅ Вхід в систему
- ✅ Вихід з акаунта
- ✅ Захищені маршрути
- ✅ Автоматичне перенаправлення

### Сторінки
- **Головна** (`/`) - лендінг сторінка
- **Авторизація** (`/auth`) - логін/реєстрація
- **Налаштування** (`/setup`) - налаштування бренду
- **Дашборд** (`/dashboard`) - основна панель
- **Сапорт** (`/support`) - управління відгуками

### Компоненти
- `AuthContext` - управління станом авторизації
- `ProtectedRoute` - захищені маршрути
- `Navbar` - навігація з кнопкою виходу
- `AuthPage` - сторінка авторизації

## Структура проекту

```
src/
├── components/
│   ├── dashboard/     # Компоненти дашборду
│   ├── layout/        # Layout компоненти
│   └── support/       # Компоненти сапорту
├── contexts/          # React контексти
├── pages/            # Сторінки додатку
├── types/            # TypeScript типи
└── utils/            # Утиліти
```

## Розробка

### Лінт
```bash
npm run lint
```

### Збірка
```bash
npm run build
```

### Прев'ю
```bash
npm run preview
```
