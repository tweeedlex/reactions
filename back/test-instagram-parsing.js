const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testInstagramParsing() {
  try {
    console.log('🧪 Тестування Instagram парсингу...\n');

    // Тест парсингу коментарів
    const parseData = {
      urls: [
        'https://www.instagram.com/p/DI_rMo2CCTz'
      ],
      maxComments: 50,
      useApifyProxy: true
    };

    console.log('📤 Відправка запиту на парсинг...');
    const parseResponse = await axios.post(`${BASE_URL}/instagram-parsing/parse`, parseData);
    console.log('✅ Парсинг завершено!');
    console.log(`📊 Збережено коментарів: ${parseResponse.data.length}`);
    
    if (parseResponse.data.length > 0) {
      console.log('\n📝 Приклад коментаря:');
      console.log(JSON.stringify(parseResponse.data[0], null, 2));
    }

    // Тест отримання всіх коментарів
    console.log('\n📥 Отримання всіх коментарів...');
    const allComments = await axios.get(`${BASE_URL}/instagram-parsing/comments`);
    console.log(`📊 Загальна кількість коментарів: ${allComments.data.length}`);

    // Тест отримання коментарів за URL
    console.log('\n🔍 Отримання коментарів за URL...');
    const urlComments = await axios.get(`${BASE_URL}/instagram-parsing/comments/by-url?url=${encodeURIComponent(parseData.urls[0])}`);
    console.log(`📊 Коментарів для поста: ${urlComments.data.length}`);

    console.log('\n✅ Всі тести пройшли успішно!');

  } catch (error) {
    console.error('❌ Помилка при тестуванні:', error.response?.data || error.message);
  }
}

// Запуск тесту
testInstagramParsing();
