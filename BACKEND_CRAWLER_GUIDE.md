# Backend Crawler Guide

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

### 2. Добавление статуса задачи
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

### 3. Сохранение результатов
```javascript
// Сохранить результат краулинга
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
    for (const result of results) {
      await supabase
        .from('crawler.company_messages')
        .insert({
          task_id: task.task_id,
          text: result.text,
          context: JSON.stringify(result.context)
        });
    }
    
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
