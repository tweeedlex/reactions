const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function debugInstagramParsing() {
  try {
    console.log('🔍 Діагностика Instagram парсингу...\n');

    // Тест 1: Перевірка сервера
    console.log('📡 Тест 1: Перевірка сервера');
    const healthCheck = await axios.get(`${BASE_URL}/instagram-parsing/comments`);
    console.log('✅ Сервер працює');
    console.log(`📊 Поточні коментарі: ${healthCheck.data.length}`);

    // Тест 2: Парсинг з детальним логуванням
    console.log('\n📤 Тест 2: Парсинг з логуванням');
    const parseData = {
      urls: ['https://www.instagram.com/p/DI_rMo2CCTz'],
      maxComments: 2,
      useApifyProxy: true
    };

    console.log('Відправка запиту на парсинг...');
    console.log('Дані запиту:', JSON.stringify(parseData, null, 2));
    
    const parseResponse = await axios.post(`${BASE_URL}/instagram-parsing/parse`, parseData, {
      timeout: 180000 // 3 хвилини
    });
    
    console.log('✅ Парсинг завершено!');
    console.log(`📊 Результат: ${JSON.stringify(parseResponse.data, null, 2)}`);

    // Тест 3: Перевірка збережених коментарів
    console.log('\n📥 Тест 3: Перевірка збережених коментарів');
    const allComments = await axios.get(`${BASE_URL}/instagram-parsing/comments`);
    console.log(`📊 Загальна кількість коментарів: ${allComments.data.length}`);
    
    if (allComments.data.length > 0) {
      console.log('\n📝 Приклад коментаря:');
      console.log(JSON.stringify(allComments.data[0], null, 2));
    } else {
      console.log('❌ Коментарі не збереглися');
    }

    // Тест 4: Перевірка коментарів за URL
    console.log('\n🔍 Тест 4: Коментарі за URL');
    const urlComments = await axios.get(`${BASE_URL}/instagram-parsing/comments/by-url?url=${encodeURIComponent(parseData.urls[0])}`);
    console.log(`📊 Коментарів для поста: ${urlComments.data.length}`);

  } catch (error) {
    console.error('❌ Помилка при діагностиці:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Переконайтеся, що бекенд сервер запущено:');
      console.log('   cd back && npm run start:dev');
    }
  }
}

debugInstagramParsing();
