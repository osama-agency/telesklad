import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTelegramBots() {
  console.log('🔍 Диагностика Telegram ботов\n');

  try {
    // 1. Проверяем переменные окружения
    console.log('📋 Переменные окружения:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'не установлен (по умолчанию development)'}`);
    console.log(`TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? 'установлен' : 'не установлен'}`);
    console.log(`WEBAPP_TELEGRAM_BOT_TOKEN: ${process.env.WEBAPP_TELEGRAM_BOT_TOKEN ? 'установлен' : 'не установлен'}`);
    console.log('');

    // 2. Проверяем токены в базе данных
    console.log('🗄️ Токены в базе данных:');
    const settings = await prisma.settings.findMany({
      where: {
        variable: {
          in: ['tg_token', 'webapp_telegram_bot_token']
        }
      }
    });

    for (const setting of settings) {
      const maskedValue = setting.value ? 
        `${setting.value.substring(0, 10)}...${setting.value.slice(-4)}` : 
        'не установлен';
      console.log(`${setting.variable}: ${maskedValue}`);
    }
    console.log('');

    // 3. Проверяем какой токен будет использоваться в development режиме
    console.log('🎯 Логика выбора токена в development режиме:');
    
    // Имитируем логику TelegramTokenService.getTelegramBotToken()
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`Режим production: ${isProduction}`);
    
    if (!isProduction) {
      // В development - ищем webapp_telegram_bot_token
      const webappSetting = settings.find(s => s.variable === 'webapp_telegram_bot_token');
      if (webappSetting?.value) {
        console.log('✅ В development используется webapp_telegram_bot_token (тестовый бот)');
        
        // Проверяем этот токен
        try {
          const response = await fetch(`https://api.telegram.org/bot${webappSetting.value}/getMe`);
          const result = await response.json();
          if (result.ok) {
            console.log(`  Имя бота: @${result.result.username}`);
            console.log(`  ID бота: ${result.result.id}`);
            console.log(`  Токен: ${webappSetting.value.substring(0, 10)}...${webappSetting.value.slice(-4)}`);
          }
        } catch (error) {
          console.log('  ❌ Ошибка валидации токена');
        }
      } else {
        console.log('⚠️ webapp_telegram_bot_token не найден, будет использоваться основной');
      }
    }

    // Проверяем основной токен
    const mainSetting = settings.find(s => s.variable === 'tg_token');
    if (mainSetting?.value) {
      console.log('\n📱 Основной бот (tg_token):');
      try {
        const response = await fetch(`https://api.telegram.org/bot${mainSetting.value}/getMe`);
        const result = await response.json();
        if (result.ok) {
          console.log(`  Имя бота: @${result.result.username}`);
          console.log(`  ID бота: ${result.result.id}`);
          console.log(`  Токен: ${mainSetting.value.substring(0, 10)}...${mainSetting.value.slice(-4)}`);
        }
      } catch (error) {
        console.log('  ❌ Ошибка валидации основного токена');
      }
    }

    // 4. Проверяем webhook'и
    console.log('\n🌐 Webhook настройки:');
    
    for (const setting of settings) {
      if (setting.value) {
        try {
          const webhookResponse = await fetch(`https://api.telegram.org/bot${setting.value}/getWebhookInfo`);
          const webhookData = await webhookResponse.json();
          console.log(`\n${setting.variable} webhook:`);
          console.log(`  URL: ${webhookData.result?.url || 'не установлен'}`);
          console.log(`  Pending updates: ${webhookData.result?.pending_update_count || 0}`);
          if (webhookData.result?.last_error_message) {
            console.log(`  ❌ Последняя ошибка: ${webhookData.result.last_error_message}`);
          }
          if (webhookData.result?.last_error_date) {
            const errorDate = new Date(webhookData.result.last_error_date * 1000);
            console.log(`  🕐 Время ошибки: ${errorDate.toLocaleString()}`);
          }
        } catch (error) {
          console.log(`Ошибка получения webhook для ${setting.variable}:`, error);
        }
      }
    }

    console.log('\n🔧 Рекомендации:');
    console.log('1. Убедитесь что webhook\'и не пересекаются между ботами');
    console.log('2. В development режиме используется webapp_telegram_bot_token');
    console.log('3. Если нужно использовать основной бот, установите NODE_ENV=production');

    console.log('\n✅ Диагностика завершена');

  } catch (error) {
    console.error('❌ Ошибка диагностики:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTelegramBots(); 