# Frontend Crawler API Guide

## Обзор системы

Система crawler для автоматического сбора данных с различных источников (App Store, Play Market, Google Maps) по расписанию.

## Статусы задач:
1. **Planed** - Запланирована и ожидает выполнения
2. **Started** - Выполнение началось
3. **Success** - Успешно завершена
4. **Failed** - Выполнение не удалось
5. **Stoped** - Остановлена вручную

## API для Frontend

### 1. Создание задач

#### Создать задачу на выполнение сейчас
```javascript
const { data, error } = await supabase.rpc('create_task', {
  company_data_source_id: 1
});
// Возвращает: { task_id: number }
```

#### Создать задачу на определенное время
```javascript
const { data, error } = await supabase.rpc('create_scheduled_task', {
  company_data_source_id: 1,
  scheduled_at: '2024-01-15T10:00:00Z'
});
// Возвращает: { task_id: number }
```

### 2. Управление задачами

#### Остановить задачу
```javascript
const { data, error } = await supabase.rpc('stop_task', {
  task_id: 123
});
// Возвращает: { success: boolean }
```

## Views для отображения данных

### 1. Запланированные задачи
```javascript
const { data, error } = await supabase
  .from('crawler.v_tasks_planned')
  .select('*')
  .order('scheduled_at', { ascending: true });
```

**Поля:**
- `task_id` - ID задачи
- `company_id` - ID компании
- `company_title` - название компании
- `data_source_id` - ID источника данных
- `url` - URL источника
- `data_source_title` - название источника
- `data_source_type_title` - тип источника (App Store, Play Market, Google Maps)
- `interval_type_title` - тип интервала (1m, 5m, 1h, etc.)
- `minutes_interval` - интервал в минутах
- `status_title` - статус задачи
- `scheduled_at` - время планирования
- `created_at` - время создания
- `updated_at` - время обновления
- `is_ready_for_execution` - готово ли к выполнению (boolean)
- `next_scheduled_time` - следующее время выполнения
- `time_to_execution` - время до выполнения

### 2. Все задачи
```javascript
const { data, error } = await supabase
  .from('crawler.v_tasks_all')
  .select('*')
  .order('scheduled_at', { ascending: false });
```

### 3. Задачи готовые к выполнению
```javascript
const { data, error } = await supabase
  .from('crawler.v_tasks_to_execution')
  .select('*');
```

### 4. Результаты краулинга
```javascript
const { data, error } = await supabase
  .from('crawler.v_company_messages')
  .select('*')
  .order('created_at', { ascending: false });
```

**Поля:**
- `id` - ID результата
- `task_id` - ID задачи
- `company_id` - ID компании
- `company_title` - название компании
- `text` - текст сообщения/отзыва
- `context` - контекст в JSON формате (рейтинг, автор, дата и т.д.)
- `created_at` - время создания
- `data_source_title` - название источника данных
- `data_source_type_title` - тип источника (App Store, Play Market, Google Maps)
- `url` - URL источника данных

## Примеры использования для Frontend

### 1. Отображение задач
```javascript
// Показать все запланированные задачи
const { data: plannedTasks, error } = await supabase
  .from('crawler.v_tasks_planned')
  .select(`
    task_id,
    company_title,
    data_source_type_title,
    status_title,
    scheduled_at,
    is_ready_for_execution,
    time_to_execution
  `)
  .order('scheduled_at', { ascending: true });

// Показать только готовые к выполнению
const { data: readyTasks, error } = await supabase
  .from('crawler.v_tasks_to_execution')
  .select('*');

// Показать все задачи с фильтрацией
const { data: allTasks, error } = await supabase
  .from('crawler.v_tasks_all')
  .select('*')
  .eq('company_id', companyId)
  .eq('status_title', 'Planed')
  .order('scheduled_at', { ascending: false });
```

### 2. Отображение результатов краулинга
```javascript
// Получить все результаты краулинга
const { data: allResults, error } = await supabase
  .from('crawler.v_company_messages')
  .select('*')
  .order('created_at', { ascending: false });

// Получить результаты по компании
const { data: companyResults, error } = await supabase
  .from('crawler.v_company_messages')
  .select('*')
  .eq('company_id', companyId)
  .order('created_at', { ascending: false });

// Получить результаты по типу источника
const { data: appStoreResults, error } = await supabase
  .from('crawler.v_company_messages')
  .select('*')
  .eq('data_source_type_title', 'App Store')
  .order('created_at', { ascending: false });
```

### 3. Создание и управление задачами
```javascript
// Создать задачу на выполнение сейчас
const { data: newTask, error } = await supabase.rpc('create_task', {
  company_data_source_id: 1
});

// Создать задачу на определенное время
const { data: scheduledTask, error } = await supabase.rpc('create_scheduled_task', {
  company_data_source_id: 1,
  scheduled_at: '2024-01-15T10:00:00Z'
});

// Остановить задачу
const { data: stopResult, error } = await supabase.rpc('stop_task', {
  task_id: 123
});
```

## Real-time подписки

### Подписка на изменения задач
```javascript
// Подписаться на изменения в задачах
const subscription = supabase
  .channel('crawler-tasks')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'crawler', 
      table: 'task_list' 
    }, 
    (payload) => {
      console.log('Task changed:', payload);
      // Обновить UI при изменении задач
    }
  )
  .subscribe();

// Отписаться
subscription.unsubscribe();
```

### Подписка на новые результаты краулинга
```javascript
// Подписаться на новые сообщения компаний
const subscription = supabase
  .channel('company-messages')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'crawler', 
      table: 'company_messages' 
    }, 
    (payload) => {
      console.log('New message:', payload.new);
      // Обновить UI при появлении новых результатов
    }
  )
  .subscribe();
```

## Типы источников данных

1. **App Store** (type_id = 1)
2. **Play Market** (type_id = 2)  
3. **Google Maps** (type_id = 3)

## Статусы задач

1. **Planed** - Запланирована и ожидает выполнения
2. **Started** - Выполнение началось
3. **Success** - Успешно завершена
4. **Failed** - Выполнение не удалось
5. **Stoped** - Остановлена вручную

## Автопродление

- При завершении задачи (статус "Success" или "Failed") автоматически создается новая задача
- Время выполнения = NOW() + интервал из `inverval_type_id`
- Статус новой задачи = "Planed"
