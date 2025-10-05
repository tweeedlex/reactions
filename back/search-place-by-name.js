const axios = require('axios');

// Функція для пошуку Place ID через наш сервер (SerpAPI)
async function searchPlaceByName(placeName) {
  try {
    console.log(`🔍 Пошук Place ID для: "${placeName}" через наш сервер`);
    
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
      console.log('❌ Місце не знайдено');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Помилка пошуку:', error.message);
    return null;
  }
}

// Функція для пошуку за координатами через наш сервер
async function searchPlaceByCoordinates(lat, lng) {
  try {
    console.log(`🔍 Пошук Place ID за координатами: ${lat}, ${lng} через наш сервер`);
    
    const response = await axios.get('http://localhost:3000/google-maps/search-coordinates', {
      params: {
        lat: lat,
        lng: lng
      }
    });
    
    if (response.data.success && response.data.placeId) {
      console.log(`✅ Знайдено місце:`);
      console.log(`   Назва: ${response.data.placeName}`);
      console.log(`   Адреса: ${response.data.address}`);
      console.log(`   Place ID: ${response.data.placeId}`);
      return response.data.placeId;
    } else {
      console.log('❌ Місце не знайдено за координатами');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Помилка пошуку за координатами:', error.message);
    return null;
  }
}

// Приклад використання
async function main() {
  console.log('🚀 Пошук Place ID через наш сервер\n');
  
  // Пошук за назвою
  const placeId1 = await searchPlaceByName('Ресторан Україна, Київ');
  if (placeId1) {
    console.log(`\n📍 Place ID для парсингу: ${placeId1}`);
    console.log(`🔗 URL для парсингу: https://maps.google.com/maps/place/${placeId1}`);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Пошук за координатами
  const placeId2 = await searchPlaceByCoordinates(50.4501, 30.5234);
  if (placeId2) {
    console.log(`\n📍 Place ID для парсингу: ${placeId2}`);
    console.log(`🔗 URL для парсингу: https://maps.google.com/maps/place/${placeId2}`);
  }
}

main();
