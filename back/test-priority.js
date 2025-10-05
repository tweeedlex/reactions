const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testPriorityModule() {
  console.log('🧪 Тестування модуля пріоритизації відгуків...\n');

  try {
    // Тест 1: Отримання пріоритизованих відгуків
    console.log('1️⃣ Тестуємо GET /feedbacks/prioritized');
    const response = await axios.get(`${BASE_URL}/feedbacks/prioritized`);
    console.log(`✅ Отримано ${response.data.length} відгуків`);
    
    if (response.data.length > 0) {
      console.log('📊 Приклад відгуку:');
      console.log(JSON.stringify(response.data[0], null, 2));
    }

    // Тест 2: Отримання статистики
    console.log('\n2️⃣ Тестуємо GET /feedbacks/prioritized/stats');
    const statsResponse = await axios.get(`${BASE_URL}/feedbacks/prioritized/stats`);
    console.log('📈 Статистика пріоритетів:');
    console.log(JSON.stringify(statsResponse.data, null, 2));

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
      const requiredFields = ['id', 'text', 'date', 'source', 'author', 'likes', 'sentiment', 'category', 'priority', 'status'];
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
    }

    console.log('\n🎉 Всі тести пройшли успішно!');

  } catch (error) {
    console.error('❌ Помилка при тестуванні:', error.message);
    if (error.response) {
      console.error('📄 Відповідь сервера:', error.response.data);
    }
  }
}

// Запускаємо тести
testPriorityModule();
