import { SettingsService } from '../src/lib/services/SettingsService';

async function setupTestWebhook() {
  console.log('🔧 Настройка webhook для тестирования...\n');

  try {
    const settings = await SettingsService.getBotSettings();
    
    if (!settings.client_bot_token) {
      console.error('❌ Client bot token не найден');
      return;
    }

    if (!settings.webhook_url) {
      console.error('❌ Webhook URL не найден');
      return;
    }

    console.log(`🌐 Устанавливаем webhook: ${settings.webhook_url}`);
    console.log(`🤖 Для бота: @strattera_test_bot (development)\n`);

    // Устанавливаем webhook для клиентского бота (тестового)
    const webhookResponse = await fetch(`https://api.telegram.org/bot${settings.client_bot_token}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: settings.webhook_url,
        allowed_updates: ['message', 'callback_query']
      }),
    });

    const webhookResult = await webhookResponse.json();
    
    if (webhookResult.ok) {
      console.log('✅ Webhook успешно установлен для @strattera_test_bot');
    } else {
      console.error('❌ Ошибка установки webhook:', webhookResult);
    }

    // Проверяем статус webhook
    const infoResponse = await fetch(`https://api.telegram.org/bot${settings.client_bot_token}/getWebhookInfo`);
    const infoResult = await infoResponse.json();
    
    if (infoResult.ok) {
      console.log('\n📋 Статус webhook:');
      console.log(`   URL: ${infoResult.result.url || 'НЕ УСТАНОВЛЕН'}`);
      console.log(`   Последняя ошибка: ${infoResult.result.last_error_message || 'НЕТ'}`);
      console.log(`   Ожидающих обновлений: ${infoResult.result.pending_update_count || 0}`);
    }

    console.log('\n🧪 Готово к тестированию!');
    console.log('💬 Напишите сообщение боту @strattera_test_bot для проверки');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

setupTestWebhook(); 