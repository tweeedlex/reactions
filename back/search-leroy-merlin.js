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
          console.log('Raw response:', responseData.substring(0, 500));
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
    console.log('🔍 Шукаємо "Леруа Мерлен" через Google Search...');
    
    const query = 'Леруа Мерлен Київ site:maps.google.com';
    console.log(`📝 Пошук: "${query}"`);
    
    const result = await searchGoogle(query);
    
    if (result.organic && result.organic.length > 0) {
      console.log(`✅ Знайдено ${result.organic.length} результатів:`);
      
      result.organic.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   🔗 URL: ${item.link}`);
        console.log(`   📝 Опис: ${item.snippet || 'Немає'}`);
        
        // Шукаємо Place ID в URL
        const placeIdMatch = item.link.match(/ChIJ[^&?\/]+/);
        if (placeIdMatch) {
          console.log(`   ✅ Place ID: ${placeIdMatch[0]}`);
        }
      });
    } else {
      console.log('❌ Результати не знайдено');
    }
    
  } catch (error) {
    console.error('❌ Помилка:', error.message);
  }
}

// Запускаємо пошук
findLeroyMerlin();
