const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Шлях до бази даних
const dbPath = path.join(__dirname, 'reactions.db');

console.log('🗑️ Очищення бази даних...\n');

// Підключення до бази даних
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Помилка підключення до БД:', err.message);
    return;
  }
  console.log('✅ Підключено до бази даних');
});

// Очищення всіх таблиць
const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    // Спочатку отримуємо список всіх таблиць
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('❌ Помилка отримання списку таблиць:', err.message);
        reject(err);
        return;
      }

      console.log(`📋 Знайдено ${tables.length} таблиць:`);
      tables.forEach(table => {
        console.log(`  - ${table.name}`);
      });
      console.log('');

      // Очищаємо кожну таблицю
      let completed = 0;
      const total = tables.length;

      if (total === 0) {
        console.log('ℹ️ Немає таблиць для очищення');
        resolve();
        return;
      }

      tables.forEach(table => {
        db.run(`DELETE FROM ${table.name}`, (err) => {
          if (err) {
            console.error(`❌ Помилка очищення таблиці ${table.name}:`, err.message);
          } else {
            console.log(`✅ Очищено таблицю: ${table.name}`);
          }

          completed++;
          if (completed === total) {
            console.log('\n🎉 База даних успішно очищена!');
            resolve();
          }
        });
      });
    });
  });
};

// Отримуємо статистику перед очищенням
const getStats = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        reject(err);
        return;
      }

      let completed = 0;
      const stats = {};

      if (tables.length === 0) {
        resolve(stats);
        return;
      }

      tables.forEach(table => {
        db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
          if (err) {
            console.warn(`⚠️ Не вдалося отримати статистику для ${table.name}:`, err.message);
            stats[table.name] = 0;
          } else {
            stats[table.name] = row.count;
          }

          completed++;
          if (completed === tables.length) {
            resolve(stats);
          }
        });
      });
    });
  });
};

// Основна функція
async function main() {
  try {
    // Показуємо статистику до очищення
    console.log('📊 Статистика до очищення:');
    const statsBefore = await getStats();
    Object.entries(statsBefore).forEach(([table, count]) => {
      console.log(`  - ${table}: ${count} записів`);
    });
    console.log('');

    // Очищаємо базу даних
    await clearDatabase();

    // Показуємо статистику після очищення
    console.log('\n📊 Статистика після очищення:');
    const statsAfter = await getStats();
    Object.entries(statsAfter).forEach(([table, count]) => {
      console.log(`  - ${table}: ${count} записів`);
    });

  } catch (error) {
    console.error('❌ Помилка:', error.message);
  } finally {
    // Закриваємо з'єднання
    db.close((err) => {
      if (err) {
        console.error('❌ Помилка закриття БД:', err.message);
      } else {
        console.log('\n✅ З\'єднання з БД закрито');
      }
    });
  }
}

// Запускаємо очищення
main();
