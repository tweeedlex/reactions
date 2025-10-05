-- Створення таблиці reviews (відгуки/коментарі)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    author VARCHAR(255) NOT NULL,
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    source VARCHAR(50) NOT NULL,
    review_id VARCHAR(100),
    date TIMESTAMP,
    helpful INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Унікальний індекс для (source, review_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_source_review_id 
    ON reviews (source, review_id) 
    WHERE review_id IS NOT NULL;

-- Індекс для швидкого пошуку по даті та додатку
CREATE INDEX IF NOT EXISTS idx_reviews_app_id_date 
    ON reviews (app_id, date);

-- Індекси для покращення продуктивності
CREATE INDEX IF NOT EXISTS idx_reviews_app_id ON reviews (app_id);
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews (source);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews (rating);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews (date);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at);

-- Тригер для автоматичного оновлення updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
