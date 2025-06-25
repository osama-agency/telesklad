import { SettingsService } from '../src/lib/services/SettingsService';

// Все боты в системе
const BOTS = {
  'strattera_bot': {
    id: '7097447176',
    token: '7097447176:AAEcDyjXUEIjZ0-iNSE5BZMGjaiuyDQWiqg',
    username: '@strattera_bot',
    purpose: 'Основной продакшн бот (Rails)',
    status: 'ДОЛЖЕН быть свободен от webhook (Rails API)'
  },
  'strattera_test_bot': {
    id: '7754514670', 
    token: '', // Получим из настроек
    username: '@strattera_test_bot',
    purpose: 'Тестовый бот (Next.js Grammy)',
    status: 'Активен для разработки'
  },
  'telesklad_bot': {
    id: '7612206140',
    token: '', // Получим из настроек
    username: '@telesklad_bot',
    purpose: 'Админские уведомления',
    status: 'Используется для админа и курьера'
  }
};

async function checkBotWebhook(token: string, botName: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const result = await response.json();
    
    if (result.ok) {
      return {
        url: result.result.url || 'НЕТ WEBHOOK',
        pending: result.result.pending_update_count || 0,
        lastError: result.result.last_error_message || 'НЕТ ОШИБОК',
        lastErrorDate: result.result.last_error_date ? new Date(result.result.last_error_date * 1000).toISOString() : 'НЕТ'
      };
    }
    return { error: 'Не удалось получить информацию' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Неизвестная ошибка' };
  }
}

async function checkAllBotsStatus() {
  console.log('🤖 Проверка статуса всех ботов в системе...\n');

  try {
    // Получаем токены из настроек
    const settings = await SettingsService.getBotSettings();
    BOTS.strattera_test_bot.token = settings.client_bot_token || '';
    BOTS.telesklad_bot.token = settings.admin_bot_token || '';

    console.log('📋 ТЕКУЩАЯ КОНФИГУРАЦИЯ:\n');

    for (const [key, bot] of Object.entries(BOTS)) {
      console.log(`🤖 ${bot.username} (ID: ${bot.id})`);
      console.log(`   Назначение: ${bot.purpose}`);
      console.log(`   Статус: ${bot.status}`);
      
      if (bot.token) {
        console.log('   Токен: ✅ Есть');
        
        const webhookInfo = await checkBotWebhook(bot.token, key);
        if (webhookInfo.error) {
          console.log(`   Webhook: ❌ Ошибка - ${webhookInfo.error}`);
        } else {
          console.log(`   Webhook: ${webhookInfo.url === 'НЕТ WEBHOOK' ? '❌' : '✅'} ${webhookInfo.url}`);
          if (webhookInfo.pending > 0) {
            console.log(`   Ожидающих обновлений: ⚠️ ${webhookInfo.pending}`);
          }
          if (webhookInfo.lastError !== 'НЕТ ОШИБОК') {
            console.log(`   Последняя ошибка: ❌ ${webhookInfo.lastError}`);
          }
        }
      } else {
        console.log('   Токен: ❌ Отсутствует в настройках');
      }
      console.log('');
    }

    console.log('🔍 АНАЛИЗ ПРОБЛЕМЫ:\n');
    
    // Проверяем @strattera_bot
    const stratteraBotWebhook = await checkBotWebhook(BOTS.strattera_bot.token, 'strattera_bot');
    if (stratteraBotWebhook.url && stratteraBotWebhook.url !== 'НЕТ WEBHOOK') {
      console.log('⚠️ ПРОБЛЕМА: @strattera_bot имеет webhook!');
      console.log(`   Webhook URL: ${stratteraBotWebhook.url}`);
      console.log('   Это может конфликтовать с Rails сервером!');
      console.log('   РЕКОМЕНДАЦИЯ: Удалить webhook с @strattera_bot\n');
    } else {
      console.log('✅ @strattera_bot свободен от webhook (правильно для Rails)\n');
    }

    console.log('💡 РЕКОМЕНДАЦИИ:\n');
    console.log('1. @strattera_bot должен работать ТОЛЬКО с Rails API');
    console.log('2. @strattera_test_bot используется для разработки с Next.js');
    console.log('3. @telesklad_bot используется для админских уведомлений');
    console.log('\n4. Если @strattera_bot не отвечает:');
    console.log('   - Проверьте Rails сервер');
    console.log('   - Убедитесь что webhook НЕ установлен');
    console.log('   - Проверьте настройки Rails API');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkAllBotsStatus(); 