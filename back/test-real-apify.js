const { ApifyClient } = require('apify-client');

async function testRealApify() {
  try {
    console.log('🧪 Тест реального Apify API...\n');

    const client = new ApifyClient({
      token: 'apify_api_AOs1ufgCUzb2oLmuAjzEW1qiBhqQRW3jMEha',
    });

    console.log('📤 Запуск Apify Actor...');
    
    const input = {
      urls: ['https://www.instagram.com/p/DI_rMo2CCTz'],
      maxComments: 3,
      cookies: [
        {
          name: 'csrftoken',
          value: 'dummy_csrftoken_value'
        },
        {
          name: 'sessionid', 
          value: 'dummy_sessionid_value'
        }
      ],
      proxy: {
        useApifyProxy: true,
      }
    };

    console.log('📊 Вхідні дані:', JSON.stringify(input, null, 2));

    const run = await client.actor('vEjw8BIxHhgtczmoe').call(input);
    console.log('✅ Actor запущено!');
    console.log('📊 Run ID:', run.id);
    console.log('📊 Status:', run.status);

    console.log('\n📥 Отримання результатів...');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log(`📊 Кількість елементів: ${items.length}`);
    
    if (items.length > 0) {
      console.log('\n📝 Перший елемент:');
      console.log(JSON.stringify(items[0], null, 2));
    } else {
      console.log('❌ Немає даних від Apify Actor');
    }

  } catch (error) {
    console.error('❌ Помилка:', error.message);
    if (error.statusCode) {
      console.error('📊 Status Code:', error.statusCode);
    }
  }
}

testRealApify();
