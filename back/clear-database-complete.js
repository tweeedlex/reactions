const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Підключення до бази даних
const dbPath = path.join(__dirname, 'reactions.db');
const db = new sqlite3.Database(dbPath);

console.log('🗑️ Очищення бази даних...\n');

// Очищаємо всі таблиці
const tables = [
  'comments',
  'instagram_comments', 
  'review',
  'app',
  'source'
];

let completed = 0;

tables.forEach(table => {
  db.run(`DELETE FROM ${table}`, (err) => {
    if (err) {
      console.error(`❌ Помилка при очищенні таблиці ${table}:`, err.message);
    } else {
      console.log(`✅ Таблиця ${table} очищена`);
    }
    
    completed++;
    if (completed === tables.length) {
      // Скидаємо автоінкремент
      db.run("DELETE FROM sqlite_sequence", (err) => {
        if (err) {
          console.error('❌ Помилка при скиданні автоінкременту:', err.message);
        } else {
          console.log('✅ Автоінкремент скинуто');
        }
        
        // Закриваємо з'єднання
        db.close((err) => {
          if (err) {
            console.error('❌ Помилка при закритті бази:', err.message);
          } else {
            console.log('\n🎉 База даних повністю очищена!');
            console.log('📊 Всі парсені дані видалено');
            console.log('🔄 Kanban дошка тепер буде порожньою');
          }
        });
      });
    }
  });
});
