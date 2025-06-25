import { SettingsService } from '../src/lib/services/SettingsService';

async function checkBotSettings() {
  console.log('🔍 Проверка настроек ботов...\n');

  try {
    const settings = await SettingsService.getBotSettings();
    
    console.log('📋 Основные настройки:');
    console.log(`   client_bot_token: ${settings.client_bot_token ? '***заполнен***' : 'НЕ НАЙДЕН'}`);
    console.log(`   admin_bot_token: ${settings.admin_bot_token ? '***заполнен***' : 'НЕ НАЙДЕН'}`);
    console.log(`   admin_chat_id: ${settings.admin_chat_id}`);
    console.log(`   courier_tg_id: ${settings.courier_tg_id}`);
    console.log(`   webhook_url: ${settings.webhook_url || 'НЕ УСТАНОВЛЕН'}`);
    console.log(`   grammy_enabled: ${settings.grammy_enabled}`);

    const isReady = await SettingsService.isGrammyReady();
    console.log(`\n🤖 Grammy готов: ${isReady ? 'ДА ✅' : 'НЕТ ❌'}`);

    if (isReady) {
      console.log('\n🚀 Можно тестировать боты!');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

checkBotSettings(); 