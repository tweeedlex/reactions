const axios = require('axios');

// Список Place ID для тестування
const testPlaces = [
  {
    name: 'Одеса, Дерибасівська (працює)',
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    url: 'https://maps.google.com/maps/place/ChIJN1t_tDeuEmsRUsoyG83frY4'
  },
  {
    name: 'Київ, Майдан Незалежності',
    placeId: 'ChIJd8BlQ2BZwokRAFQEcDlJRAI',
    url: 'https://maps.google.com/maps/place/ChIJd8BlQ2BZwokRAFQEcDlJRAI'
  },
  {
    name: 'Лондон, Трафальгарська площа',
    placeId: 'ChIJwULG5WSOdkgR_H2kH5axt2Y',
    url: 'https://maps.google.com/maps/place/ChIJwULG5WSOdkgR_H2kH5axt2Y'
  },
  {
    name: 'Париж, Ейфелева вежа',
    placeId: 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
    url: 'https://maps.google.com/maps/place/ChIJLU7jZClu5kcR4PcOOO6p3I0'
  },
  {
    name: 'Нью-Йорк, Таймс-сквер',
    placeId: 'ChIJmQJIxlVZwokRrQIQHwj7UKk',
    url: 'https://maps.google.com/maps/place/ChIJmQJIxlVZwokRrQIQHwj7UKk'
  }
];

async function testPlace(place) {
  console.log(`\n🔍 Тестування: ${place.name}`);
  console.log(`📍 Place ID: ${place.placeId}`);
  
  try {
    const response = await axios.get('http://localhost:3000/url-parsing/parse', {
      params: {
        url: place.url,
        language: 'uk'
      },
      timeout: 10000 // 10 секунд таймаут
    });
    
    if (response.data.success) {
      console.log(`✅ Успіх! Напарсено ${response.data.count} коментарів`);
      if (response.data.comments && response.data.comments.length > 0) {
        console.log(`   Перший коментар: "${response.data.comments[0].content.substring(0, 50)}..."`);
        console.log(`   Автор: ${response.data.comments[0].author}`);
        console.log(`   Рейтинг: ${response.data.comments[0].rating}/5`);
      }
      return { success: true, count: response.data.count };
    } else {
      console.log(`❌ Помилка: ${response.data.message}`);
      return { success: false, error: response.data.message };
    }
    
  } catch (error) {
    console.log(`❌ Помилка запиту: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Тестування різних Place ID для парсингу відгуків\n');
  
  const results = [];
  
  for (const place of testPlaces) {
    const result = await testPlace(place);
    results.push({
      name: place.name,
      placeId: place.placeId,
      ...result
    });
    
    // Пауза між запитами
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Підсумок тестування:');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Працюючі Place ID (${successful.length}):`);
  successful.forEach(result => {
    console.log(`   📍 ${result.name}`);
    console.log(`      Place ID: ${result.placeId}`);
    console.log(`      Коментарів: ${result.count}`);
  });
  
  console.log(`\n❌ Непрацюючі Place ID (${failed.length}):`);
  failed.forEach(result => {
    console.log(`   📍 ${result.name}`);
    console.log(`      Place ID: ${result.placeId}`);
    console.log(`      Помилка: ${result.error}`);
  });
  
  console.log('\n💡 Рекомендації:');
  if (successful.length > 0) {
    console.log('   ✅ Використовуйте працюючі Place ID зі списку вище');
  }
  console.log('   🔍 Спробуйте знайти інші місця з відгуками');
  console.log('   📱 Використовуйте Google Maps для пошуку місць з багатьма відгуками');
}

main().catch(console.error);
