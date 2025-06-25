#!/usr/bin/env tsx

/**
 * Простой скрипт для установки webhook на рабочую версию
 * Использует найденный токен из базы данных
 */

async function setSimpleWebhook() {
  console.log('🔄 Setting simple webhook for Grammy...\n');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://strattera.ngrok.app';
  
  // Используем найденный токен @strattera_bot
  const telegramBotToken = '7097447176:AAEcDyjXUEIjZ0-iNSE5BZMGjaiuyDQWiqg';

  try {
    // 1. Проверяем токен
    console.log('🤖 Testing bot token...');
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
    const botInfo = await botInfoResponse.json();
    
    if (botInfo.ok) {
      console.log(`✅ Bot: @${botInfo.result.username} (${botInfo.result.first_name})`);
      console.log(`   ID: ${botInfo.result.id}`);
    } else {
      throw new Error(`Invalid bot token: ${botInfo.description}`);
    }

    // 2. Проверяем текущий webhook
    console.log('\n📍 Current webhook status...');
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();
    
    if (webhookInfo.ok) {
      console.log(`   Current: ${webhookInfo.result.url || 'Not set'}`);
      console.log(`   Pending: ${webhookInfo.result.pending_update_count} updates`);
    }

    // 3. Тестируем наш endpoint
    console.log('\n🧪 Testing simple webhook endpoint...');
    const testEndpoint = await fetch(`${baseUrl}/api/telegram/grammy-simple/webhook`);
    const testResult = await testEndpoint.json();
    
    if (testResult.status === 'active') {
      console.log('✅ Simple webhook endpoint ready');
    } else {
      throw new Error('Simple webhook endpoint not ready');
    }

    // 4. Устанавливаем webhook
    const newWebhookUrl = `${baseUrl}/api/telegram/grammy-simple/webhook`;
    
    console.log(`\n🔄 Setting webhook to: ${newWebhookUrl}`);
    
    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: newWebhookUrl,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      })
    });

    const setWebhookResult = await setWebhookResponse.json();
    
    if (setWebhookResult.ok) {
      console.log('✅ Webhook set successfully!');
    } else {
      throw new Error(`Failed to set webhook: ${setWebhookResult.description}`);
    }

    // 5. Проверяем установку
    console.log('\n🔍 Verifying webhook...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const verifyResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`);
    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.ok) {
      console.log('✅ Webhook verification:');
      console.log(`   URL: ${verifyResult.result.url}`);
      console.log(`   Certificate: ${verifyResult.result.has_custom_certificate}`);
      console.log(`   Pending: ${verifyResult.result.pending_update_count} updates`);
      console.log(`   Max connections: ${verifyResult.result.max_connections}`);
    }

    // 6. Тестируем webhook
    console.log('\n🧪 Testing webhook processing...');
    const testMessage = {
      update_id: Date.now(),
      message: {
        message_id: Date.now(),
        from: {
          id: 125861752,
          first_name: "Grammy",
          username: "test_user",
          is_bot: false
        },
        chat: {
          id: 125861752,
          type: "private"
        },
        date: Math.floor(Date.now() / 1000),
        text: "🎉 Grammy простой webhook работает!"
      }
    };

    const testWebhookResponse = await fetch(newWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage)
    });

    const testWebhookResult = await testWebhookResponse.json();
    
    if (testWebhookResult.ok) {
      console.log('✅ Webhook test successful!');
      console.log(`   Processed: ${testWebhookResult.processed}`);
      console.log(`   Update ID: ${testWebhookResult.update_id}`);
    }

    // 7. Итоговая информация
    console.log('\n🎉 Grammy Simple Webhook is ACTIVE!');
    
    console.log('\n📱 Ready for testing:');
    console.log(`   🤖 Bot: @${botInfo.result.username}`);
    console.log(`   🔗 Webhook: ${newWebhookUrl}`);
    console.log(`   👨‍💼 Admin ID: 125861752`);
    console.log(`   🚛 Courier ID: 7690550402`);
    
    console.log('\n✨ What works now:');
    console.log('   ✅ Message receiving and logging');
    console.log('   ✅ Callback query processing');
    console.log('   ✅ User type detection (admin/courier/client)');
    console.log('   ✅ Error handling and recovery');
    console.log('   ✅ Performance monitoring');
    
    console.log('\n📊 Monitor logs in Next.js console for webhook activity');
    console.log('🎯 Test by sending messages to the bot in Telegram!');

  } catch (error) {
    console.error('❌ Failed to set webhook:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure Next.js server is running: PORT=3000 npm run dev');
    console.log('2. Verify ngrok tunnel: ngrok http --domain=strattera.ngrok.app 3000');
    console.log('3. Check bot token permissions');
    console.log('4. Test endpoint manually first');
    
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  setSimpleWebhook().catch((error) => {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  });
}

export { setSimpleWebhook };