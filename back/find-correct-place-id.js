const axios = require('axios');

// Функція для пошуку Place ID через Google Maps API (якщо є ключ)
async function searchPlaceByCoordinates(lat, lng, apiKey) {
  try {
    console.log(`🔍 Пошук Place ID за координатами ${lat}, ${lng} через Google Maps API`);
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${lng}`,
        key: apiKey
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      const place = response.data.results[0];
      console.log(`✅ Знайдено місце:`);
      console.log(`   Назва: ${place.formatted_address}`);
      console.log(`   Place ID: ${place.place_id}`);
      return place.place_id;
    } else {
      console.log('❌ Місце не знайдено за координатами');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Помилка пошуку через Google Maps API:', error.message);
    return null;
  }
}

// Функція для пошуку через SerpAPI (якщо є ключ)
async function searchPlaceBySerpApi(lat, lng, apiKey) {
  try {
    console.log(`🔍 Пошук Place ID за координатами ${lat}, ${lng} через SerpAPI`);
    
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_maps',
        q: `${lat},${lng}`,
        api_key: apiKey
      }
    });
    
    if (response.data.local_results && response.data.local_results.length > 0) {
      const place = response.data.local_results[0];
      console.log(`✅ Знайдено місце:`);
      console.log(`   Назва: ${place.title}`);
      console.log(`   Адреса: ${place.address}`);
      console.log(`   Place ID: ${place.place_id}`);
      return place.place_id;
    } else {
      console.log('❌ Місце не знайдено через SerpAPI');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Помилка пошуку через SerpAPI:', error.message);
    return null;
  }
}

// Функція для пошуку через наш сервер (SerpAPI)
async function searchPlaceByOurServer(lat, lng) {
  try {
    console.log(`🔍 Пошук Place ID за координатами ${lat}, ${lng} через наш сервер`);
    
    // Спробуємо використати існуючий endpoint
    const response = await axios.get('http://localhost:3000/google-maps/search', {
      params: {
        placeName: `${lat},${lng}`
      }
    });
    
    if (response.data.success && response.data.placeId) {
      console.log(`✅ Знайдено місце:`);
      console.log(`   Назва: ${response.data.placeName}`);
      console.log(`   Адреса: ${response.data.address}`);
      console.log(`   Place ID: ${response.data.placeId}`);
      return response.data.placeId;
    } else {
      console.log('❌ Місце не знайдено через наш сервер');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Помилка пошуку через наш сервер:', error.message);
    return null;
  }
}

// Альтернативний спосіб - пошук за назвою місця
async function searchPlaceByName(placeName) {
  try {
    console.log(`🔍 Пошук Place ID за назвою "${placeName}" через наш сервер`);
    
    const response = await axios.get('http://localhost:3000/google-maps/search', {
      params: {
        placeName: placeName
      }
    });
    
    if (response.data.success && response.data.placeId) {
      console.log(`✅ Знайдено місце:`);
      console.log(`   Назва: ${response.data.placeName}`);
      console.log(`   Адреса: ${response.data.address}`);
      console.log(`   Place ID: ${response.data.placeId}`);
      return response.data.placeId;
    } else {
      console.log('❌ Місце не знайдено за назвою');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Помилка пошуку за назвою:', error.message);
    return null;
  }
}

async function main() {
  const lat = 50.4000574;
  const lng = 30.5350083;
  const placeName = "Леруа Мерлен";
  
  console.log('🚀 Пошук правильного Place ID для Леруа Мерлен\n');
  console.log(`📍 Координати: ${lat}, ${lng}`);
  console.log(`🏪 Назва: ${placeName}\n`);
  
  // Спробуємо різні способи пошуку
  console.log('1️⃣ Пошук за назвою через наш сервер:');
  const placeId1 = await searchPlaceByName(placeName);
  
  console.log('\n2️⃣ Пошук за координатами через наш сервер:');
  const placeId2 = await searchPlaceByOurServer(lat, lng);
  
  // Якщо знайшли Place ID, протестуємо його
  const foundPlaceId = placeId1 || placeId2;
  
  if (foundPlaceId) {
    console.log(`\n🧪 Тестування знайденого Place ID: ${foundPlaceId}`);
    
    try {
      const testResponse = await axios.get('http://localhost:3000/url-parsing/parse', {
        params: {
          url: `https://maps.google.com/maps/place/${foundPlaceId}`,
          language: 'uk'
        }
      });
      
      if (testResponse.data.success) {
        console.log(`✅ Парсинг успішний! Напарсено ${testResponse.data.count} коментарів`);
        
        if (testResponse.data.comments && testResponse.data.comments.length > 0) {
          console.log(`   Перший коментар: "${testResponse.data.comments[0].content.substring(0, 50)}..."`);
          console.log(`   Автор: ${testResponse.data.comments[0].author}`);
          console.log(`   Рейтинг: ${testResponse.data.comments[0].rating}/5`);
        }
      } else {
        console.log(`❌ Парсинг не вдався: ${testResponse.data.message}`);
      }
    } catch (error) {
      console.log(`❌ Помилка тестування: ${error.message}`);
    }
  } else {
    console.log('\n❌ Не вдалося знайти правильний Place ID');
    console.log('\n💡 Рекомендації:');
    console.log('1. Перевірте, чи є у вас Google Maps API ключ');
    console.log('2. Спробуйте знайти місце вручну в Google Maps');
    console.log('3. Використовуйте інші місця з відомими Place ID');
  }
}

main().catch(console.error);
