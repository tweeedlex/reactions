# Інтеграція з таблицею company_tags

Цей документ описує інтеграцію з таблицею `company_tags` в Supabase для управління тегами компаній.

## Структура таблиці

```sql
CREATE TABLE company_tags (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  title VARCHAR NOT NULL,
  attention_rank INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Файли та компоненти

### 1. Типи (types/index.ts)
- `CompanyTag` - інтерфейс для тегу компанії
- `CompanyState` - додано поле `companyTags`

### 2. Сервіс (utils/companyTagService.ts)
Методи для роботи з тегами:
- `getCompanyTags(companyId)` - отримати всі теги компанії
- `createCompanyTag(tag)` - створити новий тег
- `updateCompanyTag(id, updates)` - оновити тег
- `deleteCompanyTag(id)` - видалити тег
- `createMultipleTags(companyId, tagTitles, attentionRank)` - створити кілька тегів
- `tagExists(companyId, title)` - перевірити існування тегу
- `getCompanyTagsAsStrings(companyId)` - отримати теги як масив рядків

### 3. Redux slice (store/slices/companySlice.ts)
Додано async thunks:
- `fetchCompanyTags`
- `createCompanyTag`
- `createMultipleCompanyTags`
- `updateCompanyTag`
- `deleteCompanyTag`

### 4. Хук (hooks/useCompanyTags.ts)
Хук для роботи з тегами:
```typescript
const {
  tags,
  loading,
  error,
  createTag,
  createTags,
  updateTag,
  deleteTag,
  refreshTags,
  getTagsAsStrings,
  getTagsSortedByPriority,
  tagExists
} = useCompanyTags(companyId);
```

### 5. Компоненти

#### ResponseConstructor (components/support/ResponseConstructor.tsx)
- Відображає теги з тікета та з БД
- Дозволяє додавати нові теги
- Різні кольори для тегів з різних джерел

#### CompanyTagsManager (components/CompanyTagsManager.tsx)
Повноцінний менеджер тегів:
- Перегляд всіх тегів компанії
- Додавання нових тегів
- Редагування існуючих тегів
- Видалення тегів
- Сортування за пріоритетом

## Використання

### Базове використання хука
```typescript
import { useCompanyTags } from '@/hooks/useCompanyTags';

function MyComponent() {
  const { tags, createTag, loading } = useCompanyTags(companyId);
  
  const handleCreateTag = async () => {
    await createTag('Новий тег', 1);
  };
  
  return (
    <div>
      {tags.map(tag => (
        <span key={tag.id}>{tag.title}</span>
      ))}
    </div>
  );
}
```

### Використання компонента менеджера
```typescript
import { CompanyTagsManager } from '@/components/CompanyTagsManager';

function AdminPage() {
  return (
    <div>
      <CompanyTagsManager />
    </div>
  );
}
```

### Використання в ResponseConstructor
Компонент автоматично:
- Завантажує теги для поточної компанії
- Відображає теги з тікета та БД
- Дозволяє додавати нові теги
- Показує джерело кожного тегу

## Особливості

1. **Автоматичне завантаження**: Теги завантажуються при зміні компанії
2. **Сумісність**: Підтримка як тегів з тікетів, так і з БД
3. **Пріоритети**: Теги мають рівень важливості (attention_rank)
4. **Унікальність**: Перевірка на дублікати при створенні
5. **Сортування**: Автоматичне сортування за пріоритетом та датою

## Інтеграція з існуючим кодом

Теги з БД автоматично інтегруються з існуючими тегами з тікетів у компоненті `ResponseConstructor`. Користувач може:

- Бачити всі теги в одному місці
- Додавати нові теги прямо з інтерфейсу відповідей
- Розрізняти теги за джерелом (тікет vs БД)
- Використовувати теги для кращої організації контенту
