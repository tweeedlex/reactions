const axios = require('axios');

async function testSimpleInstagram() {
  try {
    console.log('🧪 Простий тест Instagram парсингу...\n');

    const parseData = {
      urls: ['https://www.instagram.com/p/DI_rMo2CCTz'],
      maxComments: 3,
      useApifyProxy: true
    };

    console.log('📤 Відправка запиту...');
    const response = await axios.post('http://localhost:3000/instagram-parsing/parse', parseData);
    console.log('✅ Запит виконано!');
    console.log(`📊 Результат: ${JSON.stringify(response.data, null, 2)}`);

    console.log('\n📥 Перевірка збережених коментарів...');
    const comments = await axios.get('http://localhost:3000/instagram-parsing/comments');
    console.log(`📊 Кількість коментарів: ${comments.data.length}`);
    
    if (comments.data.length > 0) {
      console.log('\n📝 Перший коментар:');
      console.log(JSON.stringify(comments.data[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Помилка:', error.response?.data || error.message);
  }
}

testSimpleInstagram();
