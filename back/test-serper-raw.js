const axios = require('axios');

const API_KEY = '37843c7b4f2d2571cb4db43512a5340041856528';
const BASE_URL = 'https://google.serper.dev/reviews';

async function testSerperRaw() {
  console.log('🔍 Тестування сирих даних від serper.dev...');
  
  try {
    const response = await axios.post(BASE_URL, {
      placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      hl: 'uk',
      sortBy: 'newest'
    }, {
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Відповідь отримана:');
    console.log('Статус:', response.status);
    console.log('Структура:', Object.keys(response.data));
    
    if (response.data.reviews) {
      console.log('Кількість відгуків:', response.data.reviews.length);
      
      if (response.data.reviews.length > 0) {
        console.log('\n📊 Перший відгук:');
        const firstReview = response.data.reviews[0];
        console.log('Автор:', firstReview.author);
        console.log('Контент:', firstReview.content);
        console.log('Рейтинг:', firstReview.rating);
        console.log('Дата:', firstReview.date);
        console.log('Повна структура:', JSON.stringify(firstReview, null, 2));
      }
    } else {
      console.log('❌ Відгуки не знайдено');
      console.log('Повна відповідь:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    if (error.response) {
      console.error('Статус:', error.response.status);
      console.error('Дані:', error.response.data);
    }
  }
}

testSerperRaw();
