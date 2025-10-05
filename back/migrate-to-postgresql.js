const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
require('dotenv').config();

// Підключення до SQLite
const sqliteDb = new sqlite3.Database('./reactions.db');

// Підключення до PostgreSQL
const pgClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'reactions',
});

async function migrateData() {
  try {
    await pgClient.connect();
    console.log('Підключено до PostgreSQL');

    // Отримуємо дані з SQLite
    const comments = await new Promise((resolve, reject) => {
      sqliteDb.all(`
        SELECT 
          appId, 
          appName, 
          store, 
          content, 
          author, 
          rating, 
          reviewDate, 
          helpfulVotes,
          createdAt
        FROM comments 
        ORDER BY createdAt
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`Знайдено ${comments.length} коментарів для міграції`);

    // Мігруємо кожен коментар
    for (const comment of comments) {
      try {
        // Визначаємо платформу та джерело
        let platform, source;
        switch (comment.store) {
          case 'playstore':
            platform = 'google_play';
            source = 'google_play';
            break;
          case 'appstore':
            platform = 'app_store';
            source = 'app_store';
            break;
          case 'googlemaps':
            platform = 'google_maps';
            source = 'google_maps';
            break;
          default:
            platform = 'unknown';
            source = 'unknown';
        }

        // Створюємо або отримуємо додаток
        const appResult = await pgClient.query(`
          INSERT INTO apps (platform, app_id, name, category, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (platform, app_id) 
          DO UPDATE SET 
            name = EXCLUDED.name,
            updated_at = EXCLUDED.updated_at
          RETURNING id
        `, [
          platform,
          comment.appId,
          comment.appName,
          null, // category
          comment.createdAt,
          new Date()
        ]);

        const appId = appResult.rows[0].id;

        // Створюємо відгук
        await pgClient.query(`
          INSERT INTO reviews (
            app_id, author, rating, text, source, 
            review_id, date, helpful, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (source, review_id) DO NOTHING
        `, [
          appId,
          comment.author,
          comment.rating,
          comment.content,
          source,
          null, // review_id
          comment.reviewDate || comment.createdAt,
          comment.helpfulVotes || 0,
          comment.createdAt,
          new Date()
        ]);

        console.log(`Мігровано коментар для додатку: ${comment.appName}`);
      } catch (error) {
        console.error(`Помилка при міграції коментаря:`, error);
      }
    }

    console.log('Міграція завершена успішно!');
  } catch (error) {
    console.error('Помилка міграції:', error);
  } finally {
    sqliteDb.close();
    await pgClient.end();
  }
}

migrateData();
