const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testInstagramIntegration() {
  try {
    console.log('🧪 Тестування Instagram інтеграції...\n');

    // Тест 1: Парсинг Instagram коментарів
    console.log('📤 Тест 1: Парсинг Instagram коментарів');
    const parseData = {
      urls: [
        'https://www.instagram.com/p/DI_rMo2CCTz'
      ],
      maxComments: 20,
      useApifyProxy: true
    };

    console.log('Відправка запиту на парсинг...');
    const parseResponse = await axios.post(`${BASE_URL}/instagram-parsing/parse`, parseData);
    console.log('✅ Парсинг завершено!');
    console.log(`📊 Збережено коментарів: ${parseResponse.data.length}`);
    
    if (parseResponse.data.length > 0) {
      console.log('\n📝 Приклад коментаря:');
      const sampleComment = parseResponse.data[0];
      console.log(`- Автор: ${sampleComment.authorFullName || sampleComment.authorUsername}`);
      console.log(`- Текст: ${sampleComment.text.substring(0, 100)}...`);
      console.log(`- Лайки: ${sampleComment.likesCount}`);
      console.log(`- Час: ${sampleComment.timestamp}`);
    }

    // Тест 2: Отримання всіх коментарів
    console.log('\n📥 Тест 2: Отримання всіх коментарів');
    const allComments = await axios.get(`${BASE_URL}/instagram-parsing/comments`);
    console.log(`📊 Загальна кількість коментарів: ${allComments.data.length}`);

    // Тест 3: Отримання коментарів за URL
    console.log('\n🔍 Тест 3: Отримання коментарів за URL');
    const urlComments = await axios.get(`${BASE_URL}/instagram-parsing/comments/by-url?url=${encodeURIComponent(parseData.urls[0])}`);
    console.log(`📊 Коментарів для поста: ${urlComments.data.length}`);

    // Тест 4: Перевірка структури даних
    console.log('\n🔍 Тест 4: Перевірка структури даних');
    if (allComments.data.length > 0) {
      const comment = allComments.data[0];
      const requiredFields = ['id', 'postUrl', 'commentId', 'text', 'authorUsername', 'likesCount', 'timestamp'];
      const missingFields = requiredFields.filter(field => !(field in comment));
      
      if (missingFields.length === 0) {
        console.log('✅ Всі необхідні поля присутні');
      } else {
        console.log(`❌ Відсутні поля: ${missingFields.join(', ')}`);
      }
    }

    console.log('\n✅ Всі тести пройшли успішно!');
    console.log('\n🌐 Тепер можете відкрити фронтенд:');
    console.log('   - Головна сторінка: http://localhost:5173/');
    console.log('   - Instagram парсинг: http://localhost:5173/instagram');

  } catch (error) {
    console.error('❌ Помилка при тестуванні:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Переконайтеся, що бекенд сервер запущено:');
      console.log('   cd back && npm run start:dev');
    }
  }
}

// Запуск тесту
testInstagramIntegration();
