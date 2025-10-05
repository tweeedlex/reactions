const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Підключення до бази даних
const dbPath = path.join(__dirname, 'reactions.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Перевірка даних в базі...\n');

// Перевіряємо таблицю comments
db.all("SELECT COUNT(*) as count FROM comments", (err, rows) => {
  if (err) {
    console.error('❌ Помилка при перевірці таблиці comments:', err.message);
  } else {
    console.log(`📊 Таблиця comments: ${rows[0].count} записів`);
  }
});

// Перевіряємо таблицю instagram_comments
db.all("SELECT COUNT(*) as count FROM instagram_comments", (err, rows) => {
  if (err) {
    console.error('❌ Помилка при перевірці таблиці instagram_comments:', err.message);
  } else {
    console.log(`📸 Таблиця instagram_comments: ${rows[0].count} записів`);
  }
});

// Перевіряємо таблицю reviews
db.all("SELECT COUNT(*) as count FROM review", (err, rows) => {
  if (err) {
    console.error('❌ Помилка при перевірці таблиці review:', err.message);
  } else {
    console.log(`📝 Таблиця review: ${rows[0].count} записів`);
  }
});

// Показуємо останні записи з comments
console.log('\n📋 Останні записи з таблиці comments:');
db.all("SELECT id, content, author, rating, store, createdAt FROM comments ORDER BY createdAt DESC LIMIT 5", (err, rows) => {
  if (err) {
    console.error('❌ Помилка:', err.message);
  } else {
    rows.forEach(row => {
      console.log(`  ID: ${row.id}, Автор: ${row.author}, Рейтинг: ${row.rating}, Джерело: ${row.store}`);
      console.log(`  Текст: ${row.content.substring(0, 50)}...`);
      console.log(`  Дата: ${row.createdAt}\n`);
    });
  }
});

// Показуємо останні записи з instagram_comments
console.log('📸 Останні записи з таблиці instagram_comments:');
db.all("SELECT id, text, authorUsername, likesCount, createdAt FROM instagram_comments ORDER BY createdAt DESC LIMIT 5", (err, rows) => {
  if (err) {
    console.error('❌ Помилка:', err.message);
  } else {
    rows.forEach(row => {
      console.log(`  ID: ${row.id}, Автор: ${row.authorUsername}, Лайки: ${row.likesCount}`);
      console.log(`  Текст: ${row.text.substring(0, 50)}...`);
      console.log(`  Дата: ${row.createdAt}\n`);
    });
  }
  
  // Закриваємо з'єднання
  db.close((err) => {
    if (err) {
      console.error('❌ Помилка при закритті бази:', err.message);
    } else {
      console.log('✅ База даних закрита');
    }
  });
});
