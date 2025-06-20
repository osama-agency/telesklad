-- Базовые настройки системы
INSERT INTO settings (variable, value, description, created_at, updated_at) VALUES
('shop_name', 'ТелеСклад', 'Название магазина', NOW(), NOW()),
('min_order_amount', '1000', 'Минимальная сумма заказа в рублях', NOW(), NOW()),
('delivery_price', '500', 'Стоимость доставки в рублях', NOW(), NOW()),
('maintenance_mode', 'false', 'Режим технического обслуживания', NOW(), NOW()),
('auto_update_stock', 'true', 'Автоматическое обновление остатков', NOW(), NOW()),
('bonus_threshold', '5000', 'Порог для начисления бонусов в рублях', NOW(), NOW()),
('webapp_url', 'https://webapp.telesklad.ru', 'URL веб-приложения', NOW(), NOW()),
('telegram_bot_token', '', 'Токен Telegram бота', NOW(), NOW()),
('telegram_chat_id', '', 'Chat ID для уведомлений', NOW(), NOW()),
('notification_email', 'admin@telesklad.ru', 'Email для уведомлений', NOW(), NOW()),
('usd_buffer_percent', '5.0', 'Буфер для курса USD в процентах', NOW(), NOW()),
('try_buffer_percent', '5.0', 'Буфер для курса TRY в процентах', NOW(), NOW()),
('auto_exchange_update', 'true', 'Автоматическое обновление курсов', NOW(), NOW()),
('backup_schedule', 'daily', 'Расписание резервного копирования', NOW(), NOW()),
('backup_time', '03:00', 'Время создания резервной копии', NOW(), NOW()),
('api_key', 'sk_live_' || substr(md5(random()::text), 1, 32), 'API ключ для интеграций', NOW(), NOW()),
('api_logging', 'true', 'Логирование API запросов', NOW(), NOW()),
('api_rate_limit', 'true', 'Ограничение частоты запросов', NOW(), NOW()),
('api_max_requests', '60', 'Максимум запросов в минуту', NOW(), NOW())
ON CONFLICT (variable) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW(); 