const { getJson } = require('serpapi');

async function testPlayStore() {
  try {
    console.log('Тестуємо парсинг Google Play Store...');
    
    const response = await getJson({
      engine: 'google_play_product',
      product_id: 'com.whatsapp',
      store: 'apps',
      api_key: 'fda426065a3f31f282eac9271c52fd8eebfe6a5b858b1bc4db2f1bd40112a505',
      hl: 'uk',
      gl: 'ua',
      reviews: true,
      num: 5
    });

    console.log('✅ Google Play Store працює!');
    console.log('Назва додатку:', response.product_info?.title || 'Невідома');
    console.log('Кількість відгуків:', response.reviews?.length || 0);
    
    if (response.reviews && response.reviews.length > 0) {
      console.log('Перший відгук:', response.reviews[0]);
    }
  } catch (error) {
    console.error('❌ Помилка Google Play Store:', error.message);
    console.error('Деталі:', error);
  }
}

testPlayStore();
