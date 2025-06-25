#!/usr/bin/env tsx

/**
 * Скрипт для переключения на рабочую версию Grammy webhook
 * Переносит webhook с grammy/webhook на grammy-simple/webhook
 */

async function switchToWorkingWebhook() {
  console.log('🔄 Switching to working Grammy webhook...\n');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://strattera.ngrok.app';
  const telegramBotToken = process.env.WEBAPP_TELEGRAM_BOT_TOKEN;

  if (!telegramBotToken) {
    console.error('❌ WEBAPP_TELEGRAM_BOT_TOKEN not found in environment');
    process.exit(1);
  }

  try {
    // 1. Проверяем текущий webhook
    console.log('📍 Checking current webhook status...');
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();
    
    if (webhookInfo.ok) {
      console.log('✅ Current webhook:', webhookInfo.result.url || 'Not set');
      if (webhookInfo.result.pending_update_count > 0) {
        console.log(`⚠️ Pending updates: ${webhookInfo.result.pending_update_count}`);
      }
    }

    // 2. Тестируем новый простой endpoint
    console.log('\n🧪 Testing simple webhook endpoint...');
    const testResponse = await fetch(`${baseUrl}/api/telegram/grammy-simple/webhook`);
    const testResult = await testResponse.json();
    
    if (testResult.status === 'active') {
      console.log('✅ Simple webhook endpoint is ready');
    } else {
      throw new Error('Simple webhook endpoint not ready');
    }

    // 3. Устанавливаем новый webhook
    console.log('\n🔄 Setting webhook to simple endpoint...');
    const newWebhookUrl = `${baseUrl}/api/telegram/grammy-simple/webhook`;
    
    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: newWebhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });

    const setWebhookResult = await setWebhookResponse.json();
    
    if (setWebhookResult.ok) {
      console.log('✅ Webhook updated successfully!');
      console.log(`🔗 New webhook URL: ${newWebhookUrl}`);
    } else {
      throw new Error(`Failed to set webhook: ${setWebhookResult.description}`);
    }

    // 4. Проверяем новый webhook
    console.log('\n🔍 Verifying new webhook...');
    const verifyResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`);
    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.ok && verifyResult.result.url === newWebhookUrl) {
      console.log('✅ Webhook verification successful!');
      
      // Показываем детали
      console.log(`   URL: ${verifyResult.result.url}`);
      console.log(`   Has certificate: ${verifyResult.result.has_custom_certificate}`);
      console.log(`   Pending updates: ${verifyResult.result.pending_update_count}`);
      console.log(`   Max connections: ${verifyResult.result.max_connections}`);
      console.log(`   Allowed updates: ${verifyResult.result.allowed_updates?.join(', ')}`);
      
    } else {
      throw new Error('Webhook verification failed');
    }

    // 5. Тестируем отправку сообщения
    console.log('\n🧪 Testing webhook with real message...');
    const testMessage = {
      update_id: Date.now(),
      message: {
        message_id: Date.now(),
        from: {
          id: 125861752,
          first_name: "Test",
          is_bot: false
        },
        chat: {
          id: 125861752,
          type: "private"
        },
        date: Math.floor(Date.now() / 1000),
        text: "🧪 Grammy webhook test"
      }
    };

    const testWebhookResponse = await fetch(newWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    const testWebhookResult = await testWebhookResponse.json();
    
    if (testWebhookResult.ok && testWebhookResult.processed) {
      console.log('✅ Webhook test message processed successfully!');
      console.log(`   Update ID: ${testWebhookResult.update_id}`);
      console.log(`   Timestamp: ${testWebhookResult.timestamp}`);
    } else {
      console.log('⚠️ Webhook test failed, but webhook is set');
    }

    // 6. Итоговая информация
    console.log('\n🎉 Grammy webhook switch completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the bot by sending messages in Telegram');
    console.log('2. Check logs for webhook processing');
    console.log('3. Monitor performance metrics');
    
    console.log('\n🔧 Available endpoints:');
    console.log(`   Simple Webhook: ${baseUrl}/api/telegram/grammy-simple/webhook`);
    console.log(`   Original Webhook: ${baseUrl}/api/telegram/grammy/webhook`);
    
    console.log('\n📱 Test bot: @strattera_test_bot');
    console.log('👨‍💼 Admin ID: 125861752');
    console.log('🚛 Courier ID: 7690550402');

    console.log('\n✅ Grammy webhook is now using the working simple version!');

  } catch (error) {
    console.error('❌ Failed to switch webhook:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check that Next.js server is running on port 3000');
    console.log('2. Verify ngrok is forwarding to localhost:3000');
    console.log('3. Check environment variables');
    console.log('4. Verify bot token is correct');
    
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  switchToWorkingWebhook().catch((error) => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

export { switchToWorkingWebhook };