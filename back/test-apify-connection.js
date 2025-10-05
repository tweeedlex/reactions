const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: 'apify_api_AOs1ufgCUzb2oLmuAjzEW1qiBhqQRW3jMEha',
});

async function testApifyConnection() {
  try {
    console.log('🧪 Тестування підключення до Apify...\n');

    // Перевірка токена
    console.log('📡 Перевірка токена...');
    const user = await client.user().get();
    console.log('✅ Токен валідний!');
    console.log(`👤 Користувач: ${user.username}`);
    console.log(`💰 Токенів: ${user.tokensUsed} / ${user.tokensLimit}`);

    // Перевірка Actor
    console.log('\n🎭 Перевірка Actor...');
    const actor = await client.actor('vEjw8BIxHhgtczmoe').get();
    console.log('✅ Actor знайдено!');
    console.log(`📝 Назва: ${actor.name}`);
    console.log(`📊 Версія: ${actor.versionNumber}`);

    // Тест запуску Actor
    console.log('\n🚀 Тест запуску Actor...');
    const input = {
      urls: ['https://www.instagram.com/p/DI_rMo2CCTz'],
      maxComments: 5,
      proxy: {
        useApifyProxy: true,
      },
      cookies: [
        {
          name: 'sessionid',
          value: 'dummy_session_id',
          domain: '.instagram.com',
          path: '/',
          expires: new Date(Date.now() + 86400000).toISOString()
        }
      ],
      resultsType: "posts",
      resultsLimit: 5,
    };

    console.log('📤 Відправка запиту...');
    const run = await client.actor('vEjw8BIxHhgtczmoe').call(input);
    console.log('✅ Actor запущено!');
    console.log(`🆔 Run ID: ${run.id}`);
    console.log(`📊 Статус: ${run.status}`);

    // Очікування завершення
    console.log('\n⏳ Очікування завершення...');
    const finishedRun = await client.run(run.id).waitForFinish();
    console.log(`✅ Завершено! Статус: ${finishedRun.status}`);

    // Отримання результатів
    console.log('\n📥 Отримання результатів...');
    const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();
    console.log(`📊 Знайдено елементів: ${items.length}`);
    
    if (items.length > 0) {
      console.log('\n📝 Приклад результату:');
      console.log(JSON.stringify(items[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Помилка:', error.message);
    
    if (error.message.includes('rent a paid Actor')) {
      console.log('\n💡 Actor потребує оплати. Перейдіть на: https://console.apify.com/actors/vEjw8BIxHhgtczmoe');
    }
  }
}

testApifyConnection();
