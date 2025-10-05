const https = require('https');

const API_KEY = '37843c7b4f2d2571cb4db43512a5340041856528';

async function searchPlace(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      q: query,
      hl: 'uk',
      gl: 'ua',
      num: 10
    });

    const options = {
      hostname: 'google.serper.dev',
      port: 443,
      path: '/maps/search',
      method: 'POST',
      headers: {
        'X-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function findLeroyMerlin() {
  try {
    console.log('🔍 Шукаємо "Леруа Мерлен" в Києві...');
    
    const queries = [
      'Леруа Мерлен Київ',
      'Leroy Merlin Kyiv',
      'Леруа Мерлен Киев',
      'Leroy Merlin Ukraine'
    ];

    for (const query of queries) {
      console.log(`\n📝 Пошук: "${query}"`);
      
      try {
        const result = await searchPlace(query);
        
        if (result.places && result.places.length > 0) {
          console.log(`✅ Знайдено ${result.places.length} місць:`);
          
          result.places.forEach((place, index) => {
            console.log(`\n${index + 1}. ${place.title}`);
            console.log(`   📍 Адреса: ${place.address}`);
            console.log(`   🆔 Place ID: ${place.placeId || 'Немає'}`);
            console.log(`   ⭐ Рейтинг: ${place.rating || 'Немає'}`);
            console.log(`   📞 Телефон: ${place.phoneNumber || 'Немає'}`);
            console.log(`   🌐 URL: ${place.googleMapsUrl || 'Немає'}`);
            
            if (place.placeId && place.placeId.startsWith('ChIJ')) {
              console.log(`   ✅ ВАЛІДНИЙ Place ID: ${place.placeId}`);
            }
          });
          
          // Якщо знайшли валідний Place ID, зупиняємо пошук
          const validPlace = result.places.find(p => p.placeId && p.placeId.startsWith('ChIJ'));
          if (validPlace) {
            console.log(`\n🎉 Знайдено валідний Place ID: ${validPlace.placeId}`);
            console.log(`📍 Місце: ${validPlace.title}`);
            console.log(`🔗 URL для тестування: https://maps.google.com/maps/place/${validPlace.placeId}`);
            break;
          }
        } else {
          console.log('❌ Місця не знайдено');
        }
      } catch (error) {
        console.log(`❌ Помилка пошуку "${query}": ${error.message}`);
      }
      
      // Пауза між запитами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Загальна помилка:', error.message);
  }
}

// Запускаємо пошук
findLeroyMerlin();
