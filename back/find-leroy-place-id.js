const https = require('https');

const API_KEY = '37843c7b4f2d2571cb4db43512a5340041856528';

async function searchGoogle(query) {
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
      path: '/search',
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

async function findLeroyMerlinPlaceId() {
  try {
    console.log('🔍 Шукаємо Place ID для "Леруа Мерлен" в Києві...');
    
    const queries = [
      'Леруа Мерлен Київ maps.google.com',
      'Leroy Merlin Kyiv maps.google.com',
      'Леруа Мерлен Киев maps.google.com'
    ];

    for (const query of queries) {
      console.log(`\n📝 Пошук: "${query}"`);
      
      try {
        const result = await searchGoogle(query);
        
        if (result.organic && result.organic.length > 0) {
          console.log(`✅ Знайдено ${result.organic.length} результатів:`);
          
          for (const item of result.organic) {
            console.log(`\n📍 ${item.title}`);
            console.log(`🔗 URL: ${item.link}`);
            
            // Шукаємо Place ID в URL
            const placeIdMatch = item.link.match(/ChIJ[^&?\/]+/);
            if (placeIdMatch) {
              const placeId = placeIdMatch[0];
              console.log(`✅ ЗНАЙДЕНО Place ID: ${placeId}`);
              console.log(`🧪 Тестуємо парсинг...`);
              
              // Тестуємо парсинг
              const testUrl = `https://maps.google.com/maps/place/${placeId}`;
              console.log(`🔗 Тестовий URL: ${testUrl}`);
              
              return placeId;
            }
          }
        } else {
          console.log('❌ Результати не знайдено');
        }
      } catch (error) {
        console.log(`❌ Помилка пошуку "${query}": ${error.message}`);
      }
      
      // Пауза між запитами
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n❌ Не вдалося знайти Place ID для "Леруа Мерлен"');
    
  } catch (error) {
    console.error('❌ Загальна помилка:', error.message);
  }
}

// Запускаємо пошук
findLeroyMerlinPlaceId();
