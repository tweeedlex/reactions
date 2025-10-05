const { getJson } = require('serpapi');

async function searchMAUPP() {
  try {
    console.log('🔍 Пошук "Футбольна арена МАУП" через SerpAPI...');
    
    const searchQueries = [
      'Футбольна арена МАУП Київ',
      'МАУП Київ футбольна арена',
      'МАУП Київ',
      'МАУП футбольна',
      'МАУП Київ спорт',
      'МАУП Київ стадіон',
      'МАУП Київ футбол'
    ];

    for (const query of searchQueries) {
      console.log(`\n🔍 Пошук: "${query}"`);
      
      const response = await getJson({
        engine: 'google_maps',
        q: query,
        api_key: 'fda426065a3f31f282eac9271c52fd8eebfe6a5b858b1bc4db2f1bd40112a505',
        hl: 'uk',
        gl: 'ua'
      });

      console.log(`📊 Результатів: ${response.local_results?.length || 0}`);
      
      if (response.local_results && response.local_results.length > 0) {
        console.log('✅ Знайдені місця:');
        response.local_results.slice(0, 3).forEach((place, index) => {
          console.log(`${index + 1}. ${place.title}`);
          console.log(`   Адреса: ${place.address || 'Немає'}`);
          console.log(`   Place ID: ${place.place_id || 'Немає'}`);
          console.log(`   Рейтинг: ${place.rating || 'Немає'}`);
          console.log('');
        });
        
        // Якщо знайшли щось схоже на МАУП, зупиняємося
        const mauppResult = response.local_results.find(place => 
          place.title.toLowerCase().includes('мауп') || 
          place.title.toLowerCase().includes('футбольна') ||
          place.title.toLowerCase().includes('арена')
        );
        
        if (mauppResult) {
          console.log('🎯 Знайдено потенційне місце МАУП!');
          console.log(`Назва: ${mauppResult.title}`);
          console.log(`Place ID: ${mauppResult.place_id}`);
          break;
        }
      } else {
        console.log('❌ Нічого не знайдено');
      }
      
      // Невелика затримка між запитами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Помилка пошуку:', error.message);
  }
}

searchMAUPP();
