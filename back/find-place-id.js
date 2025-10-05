const axios = require('axios');

// Функція для пошуку Place ID через Google Places API
async function findPlaceId(placeName, apiKey) {
  try {
    console.log(`🔍 Пошук Place ID для: "${placeName}"`);
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
      params: {
        input: placeName,
        inputtype: 'textquery',
        fields: 'place_id,name,formatted_address',
        key: apiKey
      }
    });
    
    if (response.data.candidates && response.data.candidates.length > 0) {
      const place = response.data.candidates[0];
      console.log(`✅ Знайдено місце:`);
      console.log(`   Назва: ${place.name}`);
      console.log(`   Адреса: ${place.formatted_address}`);
      console.log(`   Place ID: ${place.place_id}`);
      return place.place_id;
    } else {
      console.log('❌ Місце не знайдено');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Помилка пошуку:', error.message);
    return null;
  }
}

// Функція для пошуку через координати
async function findPlaceIdByCoordinates(lat, lng, apiKey) {
  try {
    console.log(`🔍 Пошук Place ID за координатами: ${lat}, ${lng}`);
    
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
    console.error('❌ Помилка пошуку за координатами:', error.message);
    return null;
  }
}

// Приклад використання
async function main() {
  // Замініть на ваш Google Maps API ключ
  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
  
  // Пошук за назвою
  await findPlaceId('Ресторан Україна, Київ', GOOGLE_MAPS_API_KEY);
  
  // Пошук за координатами
  await findPlaceIdByCoordinates(50.4501, 30.5234, GOOGLE_MAPS_API_KEY);
}

// main();
