-- Seed data for AI tables testing

-- 1. Insert FAQ URL sources for companies
INSERT INTO public.ai_company_faq_url_sources (company_id, title, url) VALUES
    (1, 'Rozetka FAQ - Доставка', 'https://rozetka.com.ua/faq/delivery'),
    (1, 'Rozetka FAQ - Повернення товарів', 'https://rozetka.com.ua/faq/returns'),
    (1, 'Rozetka FAQ - Оплата', 'https://rozetka.com.ua/faq/payment'),
    (1, 'Rozetka FAQ - Бонусна програма', 'https://rozetka.com.ua/faq/bonus'),
    (1, 'Rozetka FAQ - Сповіщення', 'https://rozetka.com.ua/faq/notifications'),
    (2, 'NovaPoshta FAQ - Доставка', 'https://novaposhta.ua/faq/delivery'),
    (2, 'NovaPoshta FAQ - Відстеження', 'https://novaposhta.ua/faq/tracking');

-- 2. Insert AI message analysis for existing messages
-- Note: msg_id corresponds to the actual IDs in crawler.company_messages table
-- ton_of_voice_value: -100 to 100 
INSERT INTO public.ai_msg_analyze (msg_id, msg_ticket_type_id, ton_of_voice_value, tags_array, theme_text) VALUES
    (1, 1, -75, ARRAY['сповіщення', 'бонуси', 'налаштування', 'негатив'], 'Проблема з повідомленнями про бонуси'), -- Агресивна
    (2, 2, -100, ARRAY['реклама', 'доставка', 'фільтри', 'продавці', 'негатив'], 'Фільтри продавців та доставка'), -- Максимально агресивна
    (3, 3, -50, ARRAY['додаток', 'google_play', 'технічні_проблеми', 'негатив'], 'Проблема з Google Play Services'), -- Негативна
    (4, 1, -75, ARRAY['доставка', 'терміни', 'ціни', 'негатив'], 'Затримки доставки'), -- Агресивна
    (5, 4, -100, ARRAY['гаряча_лінія', 'реклама', 'ціни', 'негатив'], 'Гаряча лінія та реклама'); -- Максимально агресивна

-- 3. Insert AI answer suggestions based on analysis
INSERT INTO public.ai_msg_answers_suggestions (llm_msg_an_id, answer_text, company_answer_data_source_id) VALUES
    (1, 'Дякуємо за зворотний зв''язок! Розуміємо вашу стурбованість щодо уведомлень про бонуси. Наразі ми працюємо над покращенням системи налаштувань уведомлень. Ви можете звернутися до нашої служби підтримки за номером 0-800-303-344 для отримання персональної допомоги з налаштуванням.', 1),
    
    (2, 'Дякуємо за детальний відгук! Щодо фільтрів продавців - ми постійно покращуємо алгоритми пошуку. Рекомендуємо використовувати фільтр "Тільки Rozetka" для гарантованої якості. З питань доставки звертайтеся: 0-800-303-344', 1),
    
    (3, 'Дякуємо за повідомлення про проблему! Це відома проблема з Google Play Services. Наша команда розробників працює над вирішенням. Тимчасово рекомендуємо оновити Google Play Services до останньої версії.', 1),
    
    (4, 'Розуміємо вашу фрустрацію щодо затримок доставки. Наразі діє безкоштовна доставка при замовленні від 1000 грн. Детальніше: https://rozetka.com.ua/faq/delivery', 1),
    
    (5, 'Щодо цін - ми постійно моніторимо ринок і намагаємося пропонувати найкращі умови. Перевірте акції та знижки в розділі "Акції"', 1);

-- Note: Additional test data for NovaPoshta would require corresponding messages in crawler.company_messages
-- For now, we only have data for Rozetka messages (IDs 1-5)