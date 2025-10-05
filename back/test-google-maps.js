const { getJson } = require('serpapi');

async function testGoogleMaps() {
  try {
    console.log('Тестуємо парсинг Google Maps відгуків...');
    
    const response = await getJson({
      engine: 'google_maps_reviews',
      place_id: 'ChIJBUVa4U7P1EAR_kYBF9IxSXY',
      api_key: 'fda426065a3f31f282eac9271c52fd8eebfe6a5b858b1bc4db2f1bd40112a505',
      hl: 'uk',
      gl: 'ua'
    });

    console.log('✅ Google Maps працює!');
    console.log('Назва місця:', response.place?.title || 'Невідома');
    console.log('Кількість відгуків:', response.reviews?.length || 0);
    
    if (response.reviews && response.reviews.length > 0) {
      console.log('Перший відгук:', response.reviews[0]);
    }
  } catch (error) {
    console.error('❌ Помилка Google Maps:', error.message);
    console.error('Деталі:', error);
  }
}

testGoogleMaps();
