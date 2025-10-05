# Backend Crawler Guide

## Логика работы:

1. **Создание задачи** → статус "Planed"
2. **Начало выполнения** → статус "Started" (через `add_task_status`)
3. **Выполнение краулинга** → сбор данных
4. **Внесение результатов** → `add_crawling_result` или `add_crawling_results` → сохраняются в `crawler.company_messages`
5. **Завершение** → статус "Success" или "Failed" (через `add_task_status`)

## Важные моменты

## Архитектура системы

### Основные компоненты:
- **Задачи** (`crawler.task_list`) - список задач для выполнения
- **Статусы** (`crawler.task_status_log`) - лог изменений статусов
- **Результаты** (`crawler.company_messages`) - результаты краулинга
- **Автопродление** - автоматическое создание новых задач

## API для бекенда

### 1. Получение задач для выполнения
```javascript
// Получить готовые к выполнению задачи
const { data: tasks, error } = await supabase.rpc('get_tasks_ready_for_execution');
```

**Возвращает:**
- `task_id` - ID задачи
- `data_source_id` - ID источника данных  
- `data_source_type_id` - тип источника (1=App Store, 2=Play Market, 3=Google Maps)
- `data_source_type_title` - название типа
- `url` - URL для краулинга
- `scheduled_at` - время планирования

### 2. Функции для внесения результатов
```javascript
// Добавить один результат краулинга
const { data: resultId, error } = await supabase.rpc('add_crawling_result', {
  p_task_id: taskId,
  p_text: 'Текст результата',
  p_context: JSON.stringify({ rating: 5, author: 'User123' })
});

// Добавить несколько результатов краулинга
const { data: count, error } = await supabase.rpc('add_crawling_results', {
  p_task_id: taskId,
  p_results: JSON.stringify([
    { text: 'Результат 1', context: { rating: 5 } },
    { text: 'Результат 2', context: { rating: 4 } }
  ])
});
```

### 3. Добавление статуса задачи
```javascript
// Начать выполнение
await supabase.rpc('add_task_status', {
  p_task_id: taskId,
  p_status_title: 'Started',
  p_metadata: JSON.stringify({
    started_at: new Date().toISOString(),
    crawler_version: '1.0.0'
  })
});

// Завершить успешно
await supabase.rpc('add_task_status', {
  p_task_id: taskId,
  p_status_title: 'Success',
  p_metadata: JSON.stringify({
    completed_at: new Date().toISOString(),
    results_count: results.length,
    processing_time: '2.5s'
  })
});

// Завершить с ошибкой
await supabase.rpc('add_task_status', {
  p_task_id: taskId,
  p_status_title: 'Failed',
  p_metadata: JSON.stringify({
    error_message: error.message,
    error_code: 'CRAWLING_ERROR',
    failed_at: new Date().toISOString()
  })
});
```

### 4. Сохранение результатов

#### Добавить один результат краулинга
```javascript
// Сохранить один результат краулинга
const { data: resultId, error } = await supabase.rpc('add_crawling_result', {
  p_task_id: taskId,
  p_text: 'Новый отзыв: "Отличное приложение!"',
  p_context: JSON.stringify({
    rating: 5,
    author: 'User123',
    date: '2024-01-15',
    source: 'App Store'
  })
});
// Возвращает: { result_id: number }
```

#### Добавить несколько результатов краулинга
```javascript
// Сохранить несколько результатов краулинга
const { data: count, error } = await supabase.rpc('add_crawling_results', {
  p_task_id: taskId,
  p_results: JSON.stringify([
    {
      text: 'Отзыв 1: "Отличное приложение!"',
      context: { rating: 5, author: 'User1', date: '2024-01-15' }
    },
    {
      text: 'Отзыв 2: "Хорошее приложение"',
      context: { rating: 4, author: 'User2', date: '2024-01-15' }
    }
  ])
});
// Возвращает: { inserted_count: number }
```

#### Альтернативный способ (прямая вставка)
```javascript
// Сохранить результат краулинга напрямую
await supabase
  .from('crawler.company_messages')
  .insert({
    task_id: taskId,
    text: 'Новый отзыв: "Отличное приложение!"',
    context: JSON.stringify({
      rating: 5,
      author: 'User123',
      date: '2024-01-15',
      source: 'App Store'
    })
  });
```

## Полный цикл обработки задачи

```javascript
// 1. Получить задачи
const { data: tasks, error } = await supabase.rpc('get_tasks_ready_for_execution');

for (const task of tasks) {
  // 2. Начать выполнение
  await supabase.rpc('add_task_status', {
    p_task_id: task.task_id,
    p_status_title: 'Started'
  });
  
  try {
    // 3. Выполнить краулинг
    let results = [];
    switch (task.data_source_type_id) {
      case 1: // App Store
        results = await crawlAppStore(task.url);
        break;
      case 2: // Play Market  
        results = await crawlPlayMarket(task.url);
        break;
      case 3: // Google Maps
        results = await crawlGoogleMaps(task.url);
        break;
    }
    
    // 4. Сохранить результаты
    // Способ 1: Добавить все результаты одной функцией
    await supabase.rpc('add_crawling_results', {
      p_task_id: task.task_id,
      p_results: JSON.stringify(results)
    });
    
    // Способ 2: Добавлять по одному (если нужен контроль)
    // for (const result of results) {
    //   await supabase.rpc('add_crawling_result', {
    //     p_task_id: task.task_id,
    //     p_text: result.text,
    //     p_context: JSON.stringify(result.context)
    //   });
    // }
    
    // 5. Завершить успешно
    await supabase.rpc('add_task_status', {
      p_task_id: task.task_id,
      p_status_title: 'Success',
      p_metadata: JSON.stringify({
        results_count: results.length
      })
    });
    
  } catch (error) {
    // 6. Завершить с ошибкой
    await supabase.rpc('add_task_status', {
      p_task_id: task.task_id,
      p_status_title: 'Failed',
      p_metadata: JSON.stringify({
        error_message: error.message,
        error_code: 'CRAWLING_ERROR'
      })
    });
  }
}
```

## Автопродление

- При статусе **"Success"** или **"Failed"** автоматически создается новая задача
- Время выполнения = NOW() + интервал из `inverval_type_id`
- Статус новой задачи = **"Planed"**

## Статусы задач

1. **Planed** - Запланирована
2. **Started** - Выполняется  
3. **Success** - Успешно завершена
4. **Failed** - Ошибка выполнения
5. **Stoped** - Остановлена вручную

## Важные моменты

- **Все изменения статусов** проходят через `task_status_log`
- **Автоматическое обновление** `task_list.last_status_id` через триггеры
- **Результаты сохраняются** в `crawler.company_messages`
- **Автопродление** работает автоматически при завершении задач
