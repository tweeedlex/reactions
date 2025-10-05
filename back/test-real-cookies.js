const { ApifyClient } = require('apify-client');

async function testRealCookies() {
  try {
    console.log('🧪 Тест з реальними Instagram cookies...\n');

    const client = new ApifyClient({
      token: 'apify_api_AOs1ufgCUzb2oLmuAjzEW1qiBhqQRW3jMEha',
    });

    console.log('📤 Запуск Apify Actor з реальними cookies...');
    
    const input = {
      urls: ['https://www.instagram.com/p/DI_rMo2CCTz'],
      maxComments: 3,
      cookies: [
        {
          name: 'csrftoken',
          value: 'k1fGQP27hCfEYrfZxsQwHi'
        },
        {
          name: 'sessionid', 
          value: '6941425350%3AmhAvtDQTETtvkG%3A21%3AAYjqxw6wmpYHtKASrmf6ThPEPkAUXs52dMHDSSelGA'
        },
        {
          name: 'ds_user_id',
          value: '6941425350'
        },
        {
          name: 'mid',
          value: 'aOHfogALAAFqqVyVePJB5oNk2yqH'
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

    console.log('\n⏳ Очікування завершення Actor...');
    
    // Очікуємо завершення Actor
    let attempts = 0;
    const maxAttempts = 30; // 5 хвилин
    
    while (attempts < maxAttempts) {
      const runInfo = await client.run(run.id).get();
      console.log(`📊 Статус: ${runInfo.status} (спроба ${attempts + 1}/${maxAttempts})`);
      
      if (runInfo.status === 'SUCCEEDED') {
        console.log('✅ Actor завершено успішно!');
        break;
      } else if (runInfo.status === 'FAILED') {
        console.log('❌ Actor завершено з помилкою!');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 секунд
      attempts++;
    }

    console.log('\n📥 Отримання результатів...');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log(`📊 Кількість елементів: ${items.length}`);
    
    if (items.length > 0) {
      console.log('\n📝 Перший елемент:');
      console.log(JSON.stringify(items[0], null, 2));
      
      if (items[0].comments && items[0].comments.length > 0) {
        console.log('\n💬 Перший коментар:');
        console.log(JSON.stringify(items[0].comments[0], null, 2));
      }
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

testRealCookies();
