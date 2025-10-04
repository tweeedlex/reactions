-- Seed data for crawler tasks testing

-- Create test tasks for Rozetka company (company_id = 1)
-- App Store source (data_source_id = 1, interval_type_id = 3 = 15 minutes)
SELECT crawler.create_task(1);

-- Play Market source (data_source_id = 2, interval_type_id = 3 = 15 minutes)  
SELECT crawler.create_task(2);

-- Google Maps source 1 (data_source_id = 3, interval_type_id = 5 = 1 hour)
SELECT crawler.create_task(3);

-- Google Maps source 2 (data_source_id = 4, interval_type_id = 5 = 1 hour)
SELECT crawler.create_task(4);

-- Google Maps source 3 (data_source_id = 5, interval_type_id = 5 = 1 hour)
SELECT crawler.create_task(5);

-- Create scheduled tasks for NovaPoshta company (company_id = 2)
-- These will be created when NovaPoshta data sources are added

-- Test functions (commented for testing):


-- 4. Test stop_task function
 SELECT crawler.stop_task(1); -- Stop first task
 SELECT crawler.stop_task(2); -- Stop second task

-- 5. Test create_scheduled_task function
 SELECT crawler.create_scheduled_task(1, NOW() + INTERVAL '30 minutes');

SELECT crawler.create_task(2);

-- 6. Test auto-renewal (uncomment to test)

--Эмулируем завершение задачи

--добавляем в статус лог начата задача через add_task_status function
SELECT crawler.add_task_status(3, 'Started', '{"started_at": "2024-01-15T10:00:00Z"}');
SELECT crawler.add_task_status(4, 'Started', '{"started_at": "2024-01-15T10:00:00Z"}');
SELECT crawler.add_task_status(5, 'Started', '{"started_at": "2024-01-15T10:00:00Z"}');
SELECT crawler.add_task_status(6, 'Started', '{"started_at": "2024-01-15T10:00:00Z"}');
SELECT crawler.add_task_status(7, 'Started', '{"started_at": "2024-01-15T10:00:00Z"}');

--добавляем в статус лог выполенна задача
SELECT crawler.add_task_status(3, 'Success', '{"completed_at": "2024-01-15T10:00:00Z"}');
SELECT crawler.add_task_status(4, 'Success', '{"completed_at": "2024-01-15T10:00:00Z"}');
SELECT crawler.add_task_status(5, 'Success', '{"completed_at": "2024-01-15T10:00:00Z"}');
SELECT crawler.add_task_status(6, 'Success', '{"completed_at": "2024-01-15T10:00:00Z"}');
SELECT crawler.add_task_status(7, 'Success', '{"completed_at": "2024-01-15T10:00:00Z"}');

--Добавим данные в crawler.company_messages
INSERT INTO crawler.company_messages (task_id, text, context) VALUES (3, 'Каждую неделю достают уведомлениями о наличиии неиспользованных бонусов, и это никак не отключить, кроме как полной блокировки уведомлений и писем! Плюс нет возможности разграничить что хочешь, чтоб присылали только пуш-уведомлениями, а что - ипо почте. В общем, приложение удобное, но система уведомлений полный абзац... UPD: Что я вам ещё должен описывать? Поддержка сказала, что ничего сделать с этим пока нельзя...', '{"rating": 5, "author": "User123", "date": "2024-01-15"}');
INSERT INTO crawler.company_messages (task_id, text, context) VALUES (4, 'В уведомлениях и предложениях "товар яким ви цикавились" тупо реклама того чем я никогда не интересовался. И при ваших объёмах и завышенных по мониторингу ценам, вы должны отменить любые платы за доставку в свои отделения, вы же не один заказ везёте,т.ч имейте совесть. Фильтры продавцов не работают,выбираешь только Rozetka, снимаешь галочку с "друг продавцы обрабатывает Rozetka" и в результате в списке левые продавцы-барыги всё равно, теперь с пометкой "реклама". как же вы задолбали!', '{"rating": 5, "author": "User123", "date": "2024-01-15"}');
INSERT INTO crawler.company_messages (task_id, text, context) VALUES (5, 'У меня приложение Google Play всегда отключено (включаю раз в месяц для обновления приложений). После одного из летних обновлений Rozetka оно просто перестало запускаться при отключенном Google Play. Уже вышло не одно обновление Розетки, но ситуация не изменилась. Приложение не запускается, а я соответственно перешел на другие площадки и их приложения, более лояльные к пользователю. upd 27.09.2025 Установил свежее обновление приложения. При выключенном Google Play всё равно не работает.', '{"rating": 5, "author": "User123", "date": "2024-01-15"}');
INSERT INTO crawler.company_messages (task_id, text, context) VALUES (6, 'Ужасный стал маркетплейс. Ладно стала платная доставка... Ладно стали брать процент за послеоплату... Но когда срок доставки сдвигается на день, потом на два, и потом на 3! - это уже слишком. Проще пойти в ближайший ритейл и взять сразу - цены одинаковые.', '{"rating": 5, "author": "User123", "date": "2024-01-15"}');
INSERT INTO crawler.company_messages (task_id, text, context) VALUES (7, 'Пришло время поменять своё мнение, к сожалению, такое бывает. Стыдно должно быть, такой крупный интернет-магазин, а телефон горячей линии до сих пор не работает, у других интернет-магазинов, несмотря на все обстоятельства, всё работает! Реклама, настойчивые предложения товаров, причём несколько раз в день, очень сильно надоедает, причём достаточно просто что-то посмотреть, и всё, ты попал на ежедневный спам, который повторяется по несколько раз в день, да и цены уже стали высокими!! Не совету', '{"rating": 5, "author": "User123", "date": "2024-01-15"}');


--test crawler.add_crawling_result function

-- SELECT crawler.add_crawling_result(
--     3,
--     'Каждую неделю достают уведомлениями о наличиии неиспользованных бонусов, и это никак не отключить, кроме как полной блокировки уведомлений и писем! Плюс нет возможности разграничить что хочешь, чтоб присылали только пуш-уведомлениями, а что - ипо почте. В общем, приложение удобное, но система уведомлений полный абзац... UPD: Что я вам ещё должен описывать? Поддержка сказала, что ничего сделать с этим пока нельзя...',
--     '{"rating": 5, "author": "User123", "date": "2024-01-15"}'
--     );

-- --test crawler.add_crawling_results function 
-- SELECT crawler.add_crawling_results(
--     4,
--     '[
--         {
--             "text": "В уведомлениях и предложениях \"товар яким ви цикавились\" тупо реклама того чем я никогда не интересовался. И при ваших объёмах и завышенных по мониторингу ценам, вы должны отменить любые платы за доставку в свои отделения, вы же не один заказ везёте,т.ч имейте совесть. Фильтры продавцов не работают,выбираешь только Rozetka, снимаешь галочку с \"друг продавцы обрабатывает Rozetka\" и в результате в списке левые продавцы-барыги всё равно, теперь с пометкой \"реклама\". как же вы задолбали!",
--             "context": {"rating": 5, "author": "User123", "date": "2024-01-15"}
--         },
--         {
--             "text": "У меня приложение Google Play всегда отключено (включаю раз в месяц для обновления приложений). После одного из летних обновлений Rozetka оно просто перестало запускаться при отключенном Google Play. Уже вышло не одно обновление Розетки, но ситуация не изменилась. Приложение не запускается, а я соответственно перешел на другие площадки и их приложения, более лояльные к пользователю. upd 27.09.2025 Установил свежее обновление приложения. При выключенном Google Play всё равно не работает.",
--             "context": {"rating": 5, "author": "User123", "date": "2024-01-15"}
--         }
--     ]'
-- );