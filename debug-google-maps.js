const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function debugGoogleMaps() {
  console.log('🔍 Діагностика Google Maps парсингу...\n');

  // Тест 1: Перевірка SerpAPI підключення
  console.log('1️⃣ Перевірка SerpAPI підключення...');
  try {
    const response = await axios.get(`${API_BASE_URL}/google-maps/test-serpapi`);
    console.log('✅ SerpAPI статус:', response.data.connected ? 'Підключено' : 'Не підключено');
    console.log('📝 Повідомлення:', response.data.message);
  } catch (error) {
    console.log('❌ Помилка перевірки SerpAPI:', error.message);
  }

  console.log('\n2️⃣ Тест парсингу Google Maps...');
  
  // Тест з різними URL
  const testUrls = [
    'https://maps.app.goo.gl/ABC123',
    'https://www.google.com/maps/place/Test+Place/@50.4501,30.5234,17z',
    'https://maps.google.com/maps?cid=123456789'
  ];

  for (const url of testUrls) {
    console.log(`\n🔗 Тестуємо URL: ${url}`);
    try {
      const startTime = Date.now();
      const response = await axios.post(`${API_BASE_URL}/google-maps/parse`, {
        url: url
      });
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log(`⏱️ Час виконання: ${duration} секунд`);
      console.log(`✅ Успіх: ${response.data.success}`);
      console.log(`📊 Знайдено відгуків: ${response.data.parsedCount}`);
      console.log(`📍 Place ID: ${response.data.placeId}`);
      console.log(`📝 Повідомлення: ${response.data.message}`);

      if (response.data.parsedCount > 0) {
        console.log('🎉 Знайдено відгуки!');
      } else {
        console.log('⚠️ Відгуки не знайдені');
      }
    } catch (error) {
      console.log(`❌ Помилка: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n3️⃣ Перевірка збережених коментарів...');
  try {
    const response = await axios.get(`${API_BASE_URL}/comments`);
    const comments = response.data;
    const googleMapsComments = comments.filter(c => c.store === 'googlemaps');
    
    console.log(`📊 Всього коментарів в БД: ${comments.length}`);
    console.log(`🗺️ Google Maps коментарів: ${googleMapsComments.length}`);
    
    if (googleMapsComments.length > 0) {
      console.log('📝 Останні Google Maps коментарі:');
      googleMapsComments.slice(0, 3).forEach((comment, index) => {
        console.log(`  ${index + 1}. ${comment.author}: ${comment.content.substring(0, 50)}...`);
      });
    } else {
      console.log('⚠️ Google Maps коментарів не знайдено в БД');
    }
  } catch (error) {
    console.log(`❌ Помилка отримання коментарів: ${error.message}`);
  }

  console.log('\n4️⃣ Перевірка пріоритизованих відгуків...');
  try {
    const response = await axios.get(`${API_BASE_URL}/feedbacks/prioritized?limit=10`);
    const feedbacks = response.data;
    const googleMapsFeedbacks = feedbacks.filter(f => f.source === 'googlemaps');
    
    console.log(`📊 Всього пріоритизованих відгуків: ${feedbacks.length}`);
    console.log(`🗺️ Google Maps відгуків: ${googleMapsFeedbacks.length}`);
    
    if (googleMapsFeedbacks.length > 0) {
      console.log('📝 Останні Google Maps відгуки:');
      googleMapsFeedbacks.slice(0, 3).forEach((feedback, index) => {
        console.log(`  ${index + 1}. ${feedback.author}: ${feedback.text.substring(0, 50)}...`);
      });
    } else {
      console.log('⚠️ Google Maps відгуків не знайдено в пріоритизованих');
    }
  } catch (error) {
    console.log(`❌ Помилка отримання пріоритизованих відгуків: ${error.message}`);
  }

  console.log('\n🏁 Діагностика завершена!');
}

debugGoogleMaps().catch(console.error);
