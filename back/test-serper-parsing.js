const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Тестові URL для різних джерел
const testUrls = [
  // Google Maps
  'https://maps.google.com/maps/place/Ресторан+Україна/@50.4501,30.5234,17z',
  
  // Google Play Store
  'https://play.google.com/store/apps/details?id=com.whatsapp',
  
  // App Store
  'https://apps.apple.com/app/whatsapp-messenger/id310633997',
  
  // Google Search
  'https://www.google.com/search?q=whatsapp+reviews'
];

async function testConnection() {
  console.log('🔧 Тестування підключення до serper.dev...');
  
  try {
    const response = await axios.get(`${BASE_URL}/url-parsing/test-connection`);
    console.log('✅ Підключення:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('❌ Помилка підключення:', error.message);
    return false;
  }
}

async function testUrlParsing(url) {
  console.log(`\n🚀 Тестування парсингу URL: ${url}`);
  
  try {
    const response = await axios.post(`${BASE_URL}/url-parsing/parse`, {
      url: url,
      language: 'uk',
      sortBy: 'newest'
    });
    
    console.log('✅ Результат парсингу:');
    console.log(`   Тип: ${response.data.type}`);
    console.log(`   Ідентифікатор: ${response.data.identifier}`);
    console.log(`   Кількість коментарів: ${response.data.count}`);
    console.log(`   Успіх: ${response.data.success}`);
    console.log(`   Повідомлення: ${response.data.message}`);
    
    if (response.data.comments && response.data.comments.length > 0) {
      console.log('   Перший коментар:');
      const firstComment = response.data.comments[0];
      console.log(`     Автор: ${firstComment.author}`);
      console.log(`     Рейтинг: ${firstComment.rating}`);
      console.log(`     Контент: ${firstComment.content.substring(0, 100)}...`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Помилка парсингу:', error.response?.data || error.message);
    return null;
  }
}

async function testDirectParsing() {
  console.log('\n🔧 Тестування прямого парсингу...');
  
  try {
    // Тест Google Maps
    console.log('\n📍 Тест Google Maps:');
    const mapsResponse = await axios.get(`${BASE_URL}/serper-parsing/google-maps?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4&language=uk`);
    console.log(`   Кількість коментарів: ${mapsResponse.data.count}`);
    
    // Тест Google Play
    console.log('\n📱 Тест Google Play Store:');
    const playResponse = await axios.get(`${BASE_URL}/serper-parsing/google-play?appId=com.whatsapp&language=uk`);
    console.log(`   Кількість коментарів: ${playResponse.data.count}`);
    
    // Тест App Store
    console.log('\n🍎 Тест App Store:');
    const appStoreResponse = await axios.get(`${BASE_URL}/serper-parsing/app-store?appId=310633997&language=uk`);
    console.log(`   Кількість коментарів: ${appStoreResponse.data.count}`);
    
    // Тест Google Search
    console.log('\n🔍 Тест Google Search:');
    const searchResponse = await axios.get(`${BASE_URL}/serper-parsing/google-search?query=whatsapp+reviews&language=uk`);
    console.log(`   Кількість коментарів: ${searchResponse.data.count}`);
    
  } catch (error) {
    console.error('❌ Помилка прямого парсингу:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Запуск тестування парсингу через serper.dev\n');
  
  // Тестуємо підключення
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('❌ Не вдалося підключитися до serper.dev. Перевірте API ключ.');
    return;
  }
  
  // Тестуємо парсинг по URL
  console.log('\n📊 Тестування парсингу по URL...');
  for (const url of testUrls) {
    await testUrlParsing(url);
    // Пауза між запитами
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Тестуємо прямий парсинг
  await testDirectParsing();
  
  console.log('\n✅ Тестування завершено!');
}

// Запускаємо тести
main().catch(console.error);
