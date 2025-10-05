const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: 'apify_api_AOs1ufgCUzb2oLmuAjzEW1qiBhqQRW3jMEha',
});

async function testSimpleApify() {
  try {
    console.log('🧪 Простий тест Apify...\n');

    const input = {
      urls: ['https://www.instagram.com/p/DI_rMo2CCTz'],
      maxComments: 2,
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
      resultsLimit: 2,
    };

    console.log('📤 Запуск Actor...');
    const run = await client.actor('vEjw8BIxHhgtczmoe').call(input);
    console.log(`✅ Actor запущено! ID: ${run.id}`);

    console.log('⏳ Очікування завершення...');
    const finishedRun = await client.run(run.id).waitForFinish();
    console.log(`✅ Завершено! Статус: ${finishedRun.status}`);

    console.log('📥 Отримання результатів...');
    const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();
    console.log(`📊 Знайдено елементів: ${items.length}`);
    
    if (items.length > 0) {
      console.log('\n📝 Структура першого елемента:');
      console.log('Ключі:', Object.keys(items[0]));
      
      if (items[0].comments) {
        console.log(`📊 Кількість коментарів: ${items[0].comments.length}`);
        if (items[0].comments.length > 0) {
          console.log('📝 Перший коментар:');
          console.log(JSON.stringify(items[0].comments[0], null, 2));
        }
      }
      
      if (items[0].replies) {
        console.log(`📊 Кількість відповідей: ${items[0].replies.length}`);
      }
    } else {
      console.log('❌ Дані не отримано');
    }

  } catch (error) {
    console.error('❌ Помилка:', error.message);
  }
}

testSimpleApify();
