import { Bot } from 'grammy';

async function fixWebhook() {
  try {
    const token = process.env.WEBAPP_TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('WEBAPP_TELEGRAM_BOT_TOKEN not found');
    }

    const bot = new Bot(token);
    
    console.log('🔄 Удаляем старый webhook...');
    await bot.api.deleteWebhook({ drop_pending_updates: true });
    
    console.log('⏱️ Ждем 2 секунды...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const webhookUrl = 'https://strattera.ngrok.app/api/telegram/grammy-simple/webhook';
    console.log('🔗 Устанавливаем новый webhook:', webhookUrl);
    
    await bot.api.setWebhook(webhookUrl, {
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true
    });
    
    console.log('✅ Webhook установлен успешно!');
    
    // Проверяем статус
    const info = await bot.api.getWebhookInfo();
    console.log('📋 Информация о webhook:');
    console.log('   URL:', info.url);
    console.log('   Ожидающих обновлений:', info.pending_update_count);
    console.log('   Последняя ошибка:', info.last_error_message || 'Нет');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

fixWebhook();
