-- Миграция данных из settings_bot в settings и удаление модели settings_bot
-- Дата: 2025-01-27

BEGIN;

-- Перенос данных из settings_bot в settings (только те, которых нет в settings)
INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'client_bot_token',
  client_bot_token,
  'Токен клиентского бота для WebApp и уведомлений',
  NOW(),
  NOW()
FROM settings_bot 
WHERE client_bot_token IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'client_bot_token');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'admin_bot_token',
  admin_bot_token,
  'Токен админского бота для курьера и админа',
  NOW(),
  NOW()
FROM settings_bot 
WHERE admin_bot_token IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'admin_bot_token');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'environment',
  environment,
  'Окружение приложения (development/production)',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'environment');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'webhook_url',
  webhook_url,
  'URL для webhook Telegram ботов',
  NOW(),
  NOW()
FROM settings_bot 
WHERE webhook_url IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'webhook_url');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'webhook_secret',
  webhook_secret,
  'Секрет для webhook (если нужен)',
  NOW(),
  NOW()
FROM settings_bot 
WHERE webhook_secret IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'webhook_secret');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'webhook_max_connections',
  webhook_max_connections::text,
  'Максимум webhook соединений',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'webhook_max_connections');

-- Настройки уведомлений
INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'notifications_enabled',
  notifications_enabled::text,
  'Включены ли уведомления',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'notifications_enabled');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'admin_notifications',
  admin_notifications::text,
  'Уведомления админу',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'admin_notifications');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'courier_notifications',
  courier_notifications::text,
  'Уведомления курьеру',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'courier_notifications');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'client_notifications',
  client_notifications::text,
  'Уведомления клиентам',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'client_notifications');

-- Настройки доставки
INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'free_delivery_threshold',
  free_delivery_threshold::text,
  'Сумма для бесплатной доставки',
  NOW(),
  NOW()
FROM settings_bot 
WHERE free_delivery_threshold IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'free_delivery_threshold');

-- Настройки Grammy
INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'grammy_enabled',
  grammy_enabled::text,
  'Использовать Grammy фреймворк',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'grammy_enabled');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'grammy_webhook_endpoint',
  grammy_webhook_endpoint,
  'Grammy endpoint для webhook',
  NOW(),
  NOW()
FROM settings_bot 
WHERE grammy_webhook_endpoint IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'grammy_webhook_endpoint');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'grammy_rate_limit',
  grammy_rate_limit::text,
  'Rate limit для Grammy',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'grammy_rate_limit');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'grammy_timeout',
  grammy_timeout::text,
  'Timeout для Grammy в мс',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'grammy_timeout');

-- Дополнительные настройки
INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'maintenance_mode',
  maintenance_mode::text,
  'Режим обслуживания',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'maintenance_mode');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'maintenance_message',
  maintenance_message,
  'Сообщение при обслуживании',
  NOW(),
  NOW()
FROM settings_bot 
WHERE maintenance_message IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'maintenance_message');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'debug_mode',
  debug_mode::text,
  'Режим отладки',
  NOW(),
  NOW()
FROM settings_bot 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'debug_mode');

INSERT INTO settings (variable, value, description, created_at, updated_at)
SELECT 
  'log_level',
  log_level,
  'Уровень логирования',
  NOW(),
  NOW()
FROM settings_bot 
WHERE log_level IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM settings WHERE variable = 'log_level');

-- Обновляем существующие настройки если они отличаются
UPDATE settings SET 
  value = (SELECT webhook_url FROM settings_bot LIMIT 1),
  updated_at = NOW()
WHERE variable = 'webhook_url' 
  AND value != (SELECT webhook_url FROM settings_bot LIMIT 1)
  AND (SELECT webhook_url FROM settings_bot LIMIT 1) IS NOT NULL;

-- Удаляем таблицу settings_bot
DROP TABLE IF EXISTS settings_bot CASCADE;

-- Выводим информацию о миграции
SELECT 'Миграция завершена! Данные перенесены из settings_bot в settings' as message;

COMMIT; 