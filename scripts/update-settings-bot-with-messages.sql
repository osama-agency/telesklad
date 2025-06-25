-- Создаем таблицу settings_bot с актуальными сообщениями
CREATE TABLE IF NOT EXISTS "settings_bot" (
    "id" BIGSERIAL NOT NULL,
    "environment" VARCHAR(20) NOT NULL DEFAULT 'development',
    "primary_bot_token" VARCHAR(100),
    "test_bot_token" VARCHAR(100),
    "admin_bot_token" VARCHAR(100),
    "admin_chat_id" VARCHAR(50),
    "courier_tg_id" VARCHAR(50),
    "webhook_url" VARCHAR(500),
    "webhook_secret" VARCHAR(100),
    "webhook_max_connections" INTEGER NOT NULL DEFAULT 40,
    
    -- Актуальные шаблоны сообщений из settings
    "welcome_message" TEXT DEFAULT '👋 Добро пожаловать! Я помогу вам с заказами препаратов для лечения СДВГ.',
    "order_created_message" TEXT DEFAULT '🎉 Ваш заказ №{order} принят.',
    "order_unpaid_main_message" TEXT DEFAULT '📝 Проверьте заказ перед оплатой:',
    "payment_processing_message" TEXT DEFAULT '🎯 Идет проверка вашего перевода в нашей системе...',
    "payment_received_message" TEXT DEFAULT '❤️ Благодарим вас за покупку! 🚚 Заказ готовится к отправке.',
    "order_shipped_message" TEXT DEFAULT '✅ Заказ №{order} отправлен! Трек-номер: {tracking}',
    "order_cancelled_message" TEXT DEFAULT '❌ Ваш заказ №{order} отменён.',
    "track_number_saved_message" TEXT DEFAULT '✅ Готово! Трек-номер отправлен клиенту.',
    "unpaid_reminder_message" TEXT DEFAULT '🕘 Напоминаем об оплате заказа №{order}',
    "approved_pay_message" TEXT DEFAULT '🎉 Подтвержден платеж для заказа №{order}',
    "courier_processing_message" TEXT DEFAULT '👀 Нужно отправить заказ №{order}',
    "admin_payment_check_message" TEXT DEFAULT 'Надо проверить оплату по заказу №{order}',
    
    "bot_btn_title" TEXT DEFAULT '🛒 Каталог',
    "group_btn_title" TEXT DEFAULT '💬 Чат поддержки',
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "admin_notifications" BOOLEAN NOT NULL DEFAULT true,
    "courier_notifications" BOOLEAN NOT NULL DEFAULT true,
    "client_notifications" BOOLEAN NOT NULL DEFAULT true,
    "delivery_cost" DECIMAL(10,2) DEFAULT 500.00,
    "free_delivery_threshold" DECIMAL(10,2) DEFAULT 5000.00,
    "grammy_enabled" BOOLEAN NOT NULL DEFAULT true,
    "grammy_webhook_endpoint" VARCHAR(200) DEFAULT '/api/telegram/grammy-simple/webhook',
    "grammy_rate_limit" INTEGER NOT NULL DEFAULT 30,
    "grammy_timeout" INTEGER NOT NULL DEFAULT 5000,
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_message" TEXT DEFAULT '🔧 Бот временно недоступен. Ведутся технические работы.',
    "debug_mode" BOOLEAN NOT NULL DEFAULT false,
    "log_level" VARCHAR(20) NOT NULL DEFAULT 'info',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_admin_id" VARCHAR(50),

    CONSTRAINT "settings_bot_pkey" PRIMARY KEY ("id")
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS "settings_bot_environment_idx" ON "settings_bot"("environment");
CREATE INDEX IF NOT EXISTS "settings_bot_grammy_enabled_idx" ON "settings_bot"("grammy_enabled");

-- Вставляем настройки с актуальными сообщениями из таблицы settings
INSERT INTO "settings_bot" (
    "environment",
    "primary_bot_token",
    "test_bot_token", 
    "admin_chat_id",
    "courier_tg_id",
    "webhook_url",
    -- Получаем актуальные сообщения из settings
    "order_created_message",
    "order_unpaid_main_message", 
    "payment_processing_message",
    "payment_received_message",
    "order_shipped_message",
    "order_cancelled_message",
    "track_number_saved_message",
    "unpaid_reminder_message",
    "approved_pay_message",
    "courier_processing_message",
    "admin_payment_check_message"
) 
SELECT 
    'development' as environment,
    '7097447176:AAEcDyjXUEIjZ0-iNSE5BZMGjaiuyDQWiqg' as primary_bot_token,
    '7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg' as test_bot_token,
    '125861752' as admin_chat_id,
    '7690550402' as courier_tg_id,
    'https://strattera.ngrok.app/api/telegram/grammy-simple/webhook' as webhook_url,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_unpaid_msg'), '🎉 Ваш заказ №{order} принят.') as order_created_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_unpaid_main'), '📝 Проверьте заказ перед оплатой:') as order_unpaid_main_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_paid_client'), '🎯 Идет проверка вашего перевода в нашей системе...') as payment_processing_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_on_processing_client'), '❤️ Благодарим вас за покупку! 🚚 Заказ готовится к отправке.') as payment_received_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_on_shipped_client'), '✅ Заказ №{order} отправлен! Трек-номер: {tracking}') as order_shipped_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_cancel'), '❌ Ваш заказ №{order} отменён.') as order_cancelled_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_track_num_saved'), '✅ Готово! Трек-номер отправлен клиенту.') as track_number_saved_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_unpaid_reminder'), '🕘 Напоминаем об оплате заказа №{order}') as unpaid_reminder_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_approved_pay'), '🎉 Подтвержден платеж для заказа №{order}') as approved_pay_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_on_processing_courier'), '👀 Нужно отправить заказ №{order}') as courier_processing_message,
    COALESCE((SELECT value FROM settings WHERE variable = 'tg_msg_paid_admin'), 'Надо проверить оплату по заказу №{order}') as admin_payment_check_message;

-- Проверяем результат
SELECT * FROM settings_bot;