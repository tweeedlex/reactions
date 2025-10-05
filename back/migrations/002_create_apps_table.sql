-- Створення таблиці apps (додатки)
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    app_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Унікальний індекс для (platform, app_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_apps_platform_app_id 
    ON apps (platform, app_id);

-- Індекси для покращення продуктивності
CREATE INDEX IF NOT EXISTS idx_apps_platform ON apps (platform);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps (category);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps (created_at);

-- Тригер для автоматичного оновлення updated_at
CREATE TRIGGER update_apps_updated_at 
    BEFORE UPDATE ON apps 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
