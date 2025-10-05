-- Заполнение словарей базовыми данными

-- Заполнение типов источников данных
INSERT INTO dictionaries.data_sources_types (title) VALUES
    ('App Store'),
    ('Play Market'),
    ('Google Maps');

-- Заполнение типов тональности голоса
-- Шкала от -1.00 (агрессивный) до 1.00 (позитивный), 0.00 - нейтральный
INSERT INTO dictionaries.msg_ton_of_voices (title, value) VALUES
    ('Максимально агресивна', -100),
    ('Агресивна', -75),
    ('Негативна', -50),
    ('Легко негативна', -25),
    ('Нейтральна', 0),
    ('Легко позитивна', 25),
    ('Позитивна', 50),
    ('Дуже позитивна', 75),
    ('Максимально позитивна', 100);

-- Заполнение ролей в компаниях
INSERT INTO dictionaries.system_roles (title) VALUES
    ('Admin' ),
    ('Support Manager');

INSERT INTO dictionaries.msg_ticket_types (title, priority_rank) VALUES
    ('Проблема', 1),
    ('Питання', 2),
    ('Рекомендація', 3),
    ('Нейтральна згадка', 4);

    INSERT INTO dictionaries.msg_ticket_types (id, title, priority_rank) VALUES
    (0,'Необхідно класифікувати', 0);

-- Заполнение типов интервалов
INSERT INTO dictionaries.inverval_types (title, minutes_interval) VALUES
    ('1m', 1),
    ('5m', 5),
    ('15m', 15),
    ('30m', 30),
    ('1h', 60),
    ('2h', 120),
    ('4h', 240),
    ('6h', 360),
    ('8h', 480),
    ('12h', 720),
    ('24h', 1440);