const axios = require('axios');

// Демонстраційний тест сервісів парсингу
async function demoTest() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🚀 Демонстрація сервісів парсингу відгуків\n');

  try {
    // 1. Тестуємо підключення
    console.log('1️⃣ Тестування підключення...');
    const connectionTest = await axios.get(`${baseUrl}/serper/test-connection`);
    console.log('✅ serper.dev:', connectionTest.data.message);
    console.log('');

    // 2. Показуємо доступні джерела
    console.log('2️⃣ Доступні джерела парсингу:');
    const sourcesResponse = await axios.get(`${baseUrl}/universal-parsing/sources`);
    sourcesResponse.data.forEach(source => {
      console.log(`  - ${source.name}: ${source.description}`);
    });
    console.log('');

    // 3. Тестуємо Google Maps
    console.log('3️⃣ Тестування Google Maps...');
    try {
      const mapsResponse = await axios.post(`${baseUrl}/universal-parsing/google-maps`, null, {
        params: {
          placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
          useSerper: true,
          language: 'uk'
        }
      });
      console.log(`✅ Google Maps: ${mapsResponse.data.count} коментарів`);
    } catch (error) {
      console.log(`⚠️ Google Maps: ${error.response?.data?.message || 'Потребує правильного Place ID'}`);
    }
    console.log('');

    // 4. Тестуємо Google Play Store
    console.log('4️⃣ Тестування Google Play Store...');
    try {
      const playResponse = await axios.post(`${baseUrl}/universal-parsing/google-play`, null, {
        params: {
          appId: 'com.ereader.readera',
          language: 'uk'
        }
      });
      console.log(`✅ Google Play Store: ${playResponse.data.count} коментарів`);
    } catch (error) {
      console.log(`⚠️ Google Play Store: ${error.response?.data?.message || 'Потребує правильного App ID'}`);
    }
    console.log('');

    // 5. Тестуємо Google Search
    console.log('5️⃣ Тестування Google Search...');
    try {
      const searchResponse = await axios.post(`${baseUrl}/universal-parsing/google-search`, null, {
        params: {
          query: 'ReadEra reviews',
          language: 'uk'
        }
      });
      console.log(`✅ Google Search: ${searchResponse.data.count} коментарів`);
    } catch (error) {
      console.log(`⚠️ Google Search: ${error.response?.data?.message || 'Потребує правильного запиту'}`);
    }

    console.log('\n🎉 Демонстрація завершена!');
    console.log('\n💡 Для тестування з реальними даними використовуйте:');
    console.log('   - Google Maps: справжній Place ID з Google Maps');
    console.log('   - Google Play Store: справжній App ID з Play Store');
    console.log('   - App Store: справжній App ID з App Store');

  } catch (error) {
    console.error('❌ Помилка:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Запустіть сервер: npm run start:dev');
    }
  }
}

// Запускаємо демонстрацію
demoTest();
