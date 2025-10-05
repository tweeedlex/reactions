// Функція для витягнення Place ID з Google Maps URL
function extractPlaceIdFromUrl(url) {
  console.log('🔍 Аналіз URL:', url);
  
  // Різні патерни для витягнення Place ID
  const patterns = [
    // Патерн 1: !1sPLACE_ID:PLACE_ID
    /!1s([^:!]+):([^!]+)/,
    // Патерн 2: /place/PLACE_ID/
    /\/place\/([^\/\?]+)/,
    // Патерн 3: data=!4m6!3m5!1sPLACE_ID:PLACE_ID
    /!1s([^:!]+):([^!]+)/,
    // Патерн 4: ChIJ... (прямий Place ID)
    /(ChIJ[^\/\?&]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      // Якщо знайшли два частини (основний і допоміжний ID)
      if (match[2]) {
        console.log(`✅ Знайдено Place ID: ${match[1]}:${match[2]}`);
        return match[1]; // Повертаємо основний ID
      } else if (match[1]) {
        console.log(`✅ Знайдено Place ID: ${match[1]}`);
        return match[1];
      }
    }
  }
  
  console.log('❌ Place ID не знайдено в URL');
  return null;
}

// Функція для конвертації координат в Place ID
async function convertCoordinatesToPlaceId(lat, lng) {
  try {
    console.log(`🔍 Конвертація координат ${lat}, ${lng} в Place ID`);
    
    const response = await fetch(`http://localhost:3000/google-maps/search-coordinates?lat=${lat}&lng=${lng}`);
    const data = await response.json();
    
    if (data.success && data.placeId) {
      console.log(`✅ Place ID: ${data.placeId}`);
      return data.placeId;
    } else {
      console.log('❌ Не вдалося отримати Place ID за координатами');
      return null;
    }
  } catch (error) {
    console.log('❌ Помилка конвертації координат:', error.message);
    return null;
  }
}

// Тестування з вашим URL
const testUrl = "https://www.google.com/maps/place/%D0%9B%D0%B5%D1%80%D1%83%D0%B0+%D0%9C%D0%B5%D1%80%D0%BB%D0%B5%D0%BD/@50.4000574,30.5350083,16z/data=!4m6!3m5!1s0x40d4cf501efc747b:0xe3dbeeda9478e19d!8m2!3d50.401722!4d30.539767!16s%2Fg%2F1ptvsmft5?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D";

console.log('🚀 Витягнення Place ID з Google Maps URL\n');

// Спробуємо витягти Place ID з URL
const placeId = extractPlaceIdFromUrl(testUrl);

if (placeId) {
  console.log(`\n📍 Знайдений Place ID: ${placeId}`);
  console.log(`🔗 URL для парсингу: https://maps.google.com/maps/place/${placeId}`);
  console.log(`\n🧪 Тест парсингу:`);
  console.log(`curl "http://localhost:3000/url-parsing/parse?url=https://maps.google.com/maps/place/${placeId}&language=uk"`);
} else {
  console.log('\n🔄 Спробуємо конвертувати координати в Place ID...');
  
  // Витягуємо координати з URL
  const coordMatch = testUrl.match(/@([^,]+),([^,]+)/);
  if (coordMatch) {
    const lat = coordMatch[1];
    const lng = coordMatch[2];
    console.log(`📍 Координати: ${lat}, ${lng}`);
    
    // Конвертуємо координати в Place ID
    convertCoordinatesToPlaceId(lat, lng);
  } else {
    console.log('❌ Не вдалося витягти координати з URL');
  }
}
