-- Обновление структуры токенов в таблице settings_bot
-- Удаляем старые столбцы с токенами и добавляем новые с правильными названиями

-- Удаляем старые столбцы токенов
ALTER TABLE settings_bot DROP COLUMN IF EXISTS primary_bot_token;
ALTER TABLE settings_bot DROP COLUMN IF EXISTS test_bot_token;
ALTER TABLE settings_bot DROP COLUMN IF EXISTS admin_bot_token;

-- Добавляем новые столбцы токенов
ALTER TABLE settings_bot ADD COLUMN CLIENT_BOT_TOKEN VARCHAR(100);
ALTER TABLE settings_bot ADD COLUMN ADMIN_BOT_TOKEN VARCHAR(100);

-- Обновляем токены правильными значениями
UPDATE settings_bot SET 
    CLIENT_BOT_TOKEN = '7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg',
    ADMIN_BOT_TOKEN = '7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4'
WHERE id = 1;

-- Проверяем результат
SELECT id, environment, CLIENT_BOT_TOKEN, ADMIN_BOT_TOKEN FROM settings_bot WHERE id = 1; 