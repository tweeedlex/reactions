-- Додавання унікального обмеження для запобігання дублікатів коментарів
-- Виконайте цю міграцію для оновлення існуючої бази даних

-- Спочатку видаляємо можливі дублікати
DELETE FROM comments 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM comments 
    GROUP BY appId, content, author, rating
);

-- Додаємо унікальний індекс
CREATE UNIQUE INDEX IF NOT EXISTS unique_comment 
ON comments (appId, content, author, rating);

-- Додаємо індекси для покращення продуктивності
CREATE INDEX IF NOT EXISTS idx_comments_appid ON comments (appId);
CREATE INDEX IF NOT EXISTS idx_comments_store ON comments (store);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (createdAt);
