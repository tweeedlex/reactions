const { getJson } = require('serpapi');

async function testSerpApi() {
  try {
    console.log('Тестуємо SerpAPI...');
    
    const response = await getJson({
      engine: 'google_maps',
      q: 'Київ Україна',
      api_key: 'fda426065a3f31f282eac9271c52fd8eebfe6a5b858b1bc4db2f1bd40112a505',
      hl: 'uk',
      gl: 'ua'
    });

    console.log('✅ SerpAPI працює!');
    console.log('Відповідь:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('❌ Помилка SerpAPI:', error.message);
    console.error('Деталі:', error);
  }
}

testSerpApi();
