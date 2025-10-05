-- Вставка початкових джерел
INSERT INTO sources (name, api_key) VALUES 
    ('Google Play', NULL),
    ('App Store', NULL),
    ('Facebook', NULL),
    ('Instagram', NULL)
ON CONFLICT (name) DO NOTHING;
