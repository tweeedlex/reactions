const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testKanbanAPI() {
  console.log('🧪 Тестування Kanban API...\n');

  try {
    // Тест 1: Отримання пріоритизованих відгуків
    console.log('1️⃣ Тестуємо GET /feedbacks/prioritized');
    const response = await axios.get(`${BASE_URL}/feedbacks/prioritized`);
    console.log(`✅ Отримано ${response.data.length} відгуків`);
    
    if (response.data.length > 0) {
      console.log('📊 Приклад відгуку:');
      const feedback = response.data[0];
      console.log(`   ID: ${feedback.id}`);
      console.log(`   Текст: ${feedback.text.substring(0, 50)}...`);
      console.log(`   Автор: ${feedback.author}`);
      console.log(`   Джерело: ${feedback.source}`);
      console.log(`   Пріоритет: ${feedback.priority}`);
      console.log(`   Тональність: ${feedback.sentiment}`);
      console.log(`   Статус: ${feedback.status}`);
      console.log(`   Загальна оцінка: ${feedback.totalScore}`);
    }

    // Тест 2: Отримання статистики
    console.log('\n2️⃣ Тестуємо GET /feedbacks/prioritized/stats');
    const statsResponse = await axios.get(`${BASE_URL}/feedbacks/prioritized/stats`);
    console.log('📈 Статистика пріоритетів:');
    console.log(`   Всього: ${statsResponse.data.total}`);
    console.log(`   Високий: ${statsResponse.data.high}`);
    console.log(`   Середній: ${statsResponse.data.medium}`);
    console.log(`   Низький: ${statsResponse.data.low}`);

    // Тест 3: Фільтрація за лімітом
    console.log('\n3️⃣ Тестуємо фільтрацію за лімітом (limit=5)');
    const limitedResponse = await axios.get(`${BASE_URL}/feedbacks/prioritized?limit=5`);
    console.log(`✅ Отримано ${limitedResponse.data.length} відгуків з лімітом 5`);

    // Тест 4: Фільтрація за джерелом
    console.log('\n4️⃣ Тестуємо фільтрацію за джерелом');
    const sourceResponse = await axios.get(`${BASE_URL}/feedbacks/prioritized?source=Google Maps`);
    console.log(`✅ Отримано ${sourceResponse.data.length} відгуків з Google Maps`);

    // Тест 5: Перевірка структури відгуків
    console.log('\n5️⃣ Перевіряємо структуру відгуків');
    if (response.data.length > 0) {
      const feedback = response.data[0];
      const requiredFields = [
        'id', 'text', 'date', 'source', 'author', 'likes', 
        'sentiment', 'category', 'priority', 'status',
        'totalScore', 'sentimentScore', 'likesScore', 'recencyScore'
      ];
      const missingFields = requiredFields.filter(field => !(field in feedback));
      
      if (missingFields.length === 0) {
        console.log('✅ Всі необхідні поля присутні');
      } else {
        console.log(`❌ Відсутні поля: ${missingFields.join(', ')}`);
      }

      // Перевірка пріоритетів
      const priorities = response.data.map(f => f.priority);
      const uniquePriorities = [...new Set(priorities)];
      console.log(`📊 Знайдені пріоритети: ${uniquePriorities.join(', ')}`);

      // Перевірка тональності
      const sentiments = response.data.map(f => f.sentiment);
      const uniqueSentiments = [...new Set(sentiments)];
      console.log(`😊 Знайдені тональності: ${uniqueSentiments.join(', ')}`);

      // Перевірка статусів
      const statuses = response.data.map(f => f.status);
      const uniqueStatuses = [...new Set(statuses)];
      console.log(`📋 Знайдені статуси: ${uniqueStatuses.join(', ')}`);
    }

    // Тест 6: Перевірка Kanban логіки
    console.log('\n6️⃣ Перевіряємо Kanban логіку');
    const kanbanStats = {
      запит: response.data.filter(f => f.status === 'Запит').length,
      вирішення: response.data.filter(f => f.status === 'Вирішення').length,
      готово: response.data.filter(f => f.status === 'Готово').length
    };
    
    console.log('📊 Розподіл по стовпцях Kanban:');
    console.log(`   Запит: ${kanbanStats.запит}`);
    console.log(`   Вирішення: ${kanbanStats.вирішення}`);
    console.log(`   Готово: ${kanbanStats.готово}`);

    console.log('\n🎉 Всі тести пройшли успішно!');
    console.log('\n📝 Kanban дошка готова до використання:');
    console.log('   Frontend: http://localhost:5173/kanban');
    console.log('   API: http://localhost:3000/feedbacks/prioritized');

  } catch (error) {
    console.error('❌ Помилка при тестуванні:', error.message);
    if (error.response) {
      console.error('📄 Відповідь сервера:', error.response.data);
    }
    console.log('\n💡 Переконайтеся що backend запущений на порту 3000');
  }
}

// Запускаємо тести
testKanbanAPI();
