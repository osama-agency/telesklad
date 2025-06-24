const axios = require('axios');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const TELEGRAM_API = 'https://api.telegram.org/bot';

// Отладочная информация
console.log('🔍 Debug info:');
console.log('WEBAPP_TELEGRAM_BOT_TOKEN:', process.env.WEBAPP_TELEGRAM_BOT_TOKEN ? 'loaded' : 'missing');
console.log('TELESKLAD_BOT_TOKEN:', process.env.TELESKLAD_BOT_TOKEN ? 'loaded' : 'missing');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'missing');

// Конфигурация ботов
const BOTS = {
  test: {
    token: process.env.WEBAPP_TELEGRAM_BOT_TOKEN,
    webhookPath: '/api/telegram/webapp-webhook',
    name: '@strattera_test_bot',
    description: 'Тестовый бот для разработки'
  },
  telesklad: {
    token: process.env.TELESKLAD_BOT_TOKEN,
    webhookPath: '/api/telegram/telesklad-webhook',
    name: '@telesklad_bot',
    description: 'Бот для админов, закупок и курьеров'
  }
};

// Базовый URL для вебхуков
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://strattera-admin.vercel.app';

/**
 * Получить URL для API Telegram
 */
const getTelegramApiUrl = (token, method) => `${TELEGRAM_API}${token}/${method}`;

/**
 * Получить полный URL вебхука для бота
 */
const getWebhookUrl = (webhookPath) => `${BASE_URL}${webhookPath}`;

/**
 * Настроить вебхук для бота
 */
async function setupWebhook(botKey) {
  const bot = BOTS[botKey];
  if (!bot || !bot.token) {
    console.error(`❌ Не найден токен для бота ${botKey}`);
    return;
  }

  const webhookUrl = getWebhookUrl(bot.webhookPath);
  
  try {
    const response = await axios.post(getTelegramApiUrl(bot.token, 'setWebhook'), {
      url: webhookUrl,
      drop_pending_updates: true
    });

    if (response.data.ok) {
      console.log(`✅ Вебхук успешно установлен для ${bot.name}:`);
      console.log(`   URL: ${webhookUrl}`);
    } else {
      console.error(`❌ Ошибка установки вебхука для ${bot.name}:`, response.data.description);
    }
  } catch (error) {
    console.error(`❌ Ошибка при настройке вебхука для ${bot.name}:`, error.message);
  }
}

/**
 * Получить информацию о вебхуке бота
 */
async function getWebhookInfo(botKey) {
  const bot = BOTS[botKey];
  if (!bot || !bot.token) {
    console.error(`❌ Не найден токен для бота ${botKey}`);
    return;
  }

  try {
    const response = await axios.get(getTelegramApiUrl(bot.token, 'getWebhookInfo'));
    
    if (response.data.ok) {
      console.log(`ℹ️ Информация о вебхуке для ${bot.name}:`);
      console.log(JSON.stringify(response.data.result, null, 2));
    } else {
      console.error(`❌ Ошибка получения информации для ${bot.name}:`, response.data.description);
    }
  } catch (error) {
    console.error(`❌ Ошибка при получении информации о вебхуке для ${bot.name}:`, error.message);
  }
}

/**
 * Удалить вебхук бота
 */
async function deleteWebhook(botKey) {
  const bot = BOTS[botKey];
  if (!bot || !bot.token) {
    console.error(`❌ Не найден токен для бота ${botKey}`);
    return;
  }

  try {
    const response = await axios.post(getTelegramApiUrl(bot.token, 'deleteWebhook'), {
      drop_pending_updates: true
    });

    if (response.data.ok) {
      console.log(`✅ Вебхук успешно удален для ${bot.name}`);
    } else {
      console.error(`❌ Ошибка удаления вебхука для ${bot.name}:`, response.data.description);
    }
  } catch (error) {
    console.error(`❌ Ошибка при удалении вебхука для ${bot.name}:`, error.message);
  }
}

// Обработка аргументов командной строки
const [,, command, botKey] = process.argv;

async function main() {
  if (!command) {
    console.log(`
📝 Доступные команды:
  - setup <bot>    Настроить вебхук для бота
  - info <bot>     Получить информацию о вебхуке
  - delete <bot>   Удалить вебхук
  
🤖 Доступные боты:
  - test          ${BOTS.test.name} (${BOTS.test.description})
  - telesklad     ${BOTS.telesklad.name} (${BOTS.telesklad.description})

📋 Примеры:
  node scripts/manage-webhooks.js setup test
  node scripts/manage-webhooks.js info telesklad
    `);
    return;
  }

  if (!botKey || !BOTS[botKey]) {
    console.error('❌ Укажите правильный ключ бота (test или telesklad)');
    return;
  }

  switch (command) {
    case 'setup':
      await setupWebhook(botKey);
      break;
    case 'info':
      await getWebhookInfo(botKey);
      break;
    case 'delete':
      await deleteWebhook(botKey);
      break;
    default:
      console.error('❌ Неизвестная команда. Используйте: setup, info или delete');
  }
}

main().catch(console.error); 