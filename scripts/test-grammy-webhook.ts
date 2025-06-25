#!/usr/bin/env tsx

import { TelegramTokenService } from '../src/lib/services/telegram-token.service';

/**
 * Тестирование Grammy webhook'а
 * Проверяет работу нового endpoint'а и возможность настройки webhook'а
 */
async function testGrammyWebhook() {
  console.log('🧪 Testing Grammy webhook integration...\n');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://strattera.ngrok.app';
  const webhookUrl = `${baseUrl}/api/telegram/grammy/webhook`;

  try {
    // 1. Тестируем GET endpoint - информация о webhook'е
    console.log('📡 Testing GET endpoint...');
    const getResponse = await fetch(webhookUrl);
    const getResult = await getResponse.json();
    
    console.log('✅ GET endpoint working:');
    console.log(`   - Status: ${getResponse.status}`);
    console.log(`   - Message: ${getResult.message}`);
    console.log(`   - Available actions: ${getResult.available_actions?.join(', ')}`);
    
    // 2. Тестируем health check
    console.log('\n🏥 Testing health check...');
    const healthResponse = await fetch(`${webhookUrl}?action=health`);
    const healthResult = await healthResponse.json();
    
    console.log('✅ Health check:');
    console.log(`   - Status: ${healthResult.status}`);
    console.log(`   - Bot API: ${healthResult.checks?.bot_api}`);
    console.log(`   - Worker ready: ${healthResult.checks?.worker_ready}`);

    // 3. Тестируем metrics endpoint
    console.log('\n📊 Testing metrics endpoint...');
    const metricsResponse = await fetch(`${webhookUrl}?action=metrics`);
    const metricsResult = await metricsResponse.json();
    
    console.log('✅ Metrics endpoint:');
    console.log(`   - Messages processed: ${metricsResult.performance_metrics?.messagesProcessed || 0}`);
    console.log(`   - Errors count: ${metricsResult.performance_metrics?.errorsCount || 0}`);
    console.log(`   - Average response time: ${metricsResult.performance_metrics?.averageResponseTime?.toFixed(2) || 0}ms`);

    // 4. Тестируем настройку webhook'а через grammY
    console.log('\n🔧 Testing webhook setup with grammY...');
    
    const token = await TelegramTokenService.getWebappBotToken();
    if (!token) {
      console.error('❌ No token found for webhook setup test');
      return;
    }

    // Получаем текущую информацию о webhook'е
    const webhookInfoResponse = await fetch(
      `https://api.telegram.org/bot${token}/getWebhookInfo`
    );
    const webhookInfo = await webhookInfoResponse.json();
    
    console.log('📋 Current webhook info:');
    console.log(`   - URL: ${webhookInfo.result?.url || 'Not set'}`);
    console.log(`   - Pending updates: ${webhookInfo.result?.pending_update_count || 0}`);
    console.log(`   - Max connections: ${webhookInfo.result?.max_connections || 'default'}`);
    console.log(`   - Allowed updates: ${webhookInfo.result?.allowed_updates?.join(', ') || 'all'}`);

    // 5. Тестируем установку нового webhook'а (осторожно!)
    console.log('\n⚠️  Testing webhook setup (will update real webhook)...');
    
    const setupResponse = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
          max_connections: 40,
          drop_pending_updates: false
        })
      }
    );
    
    const setupResult = await setupResponse.json();
    
    if (setupResult.ok) {
      console.log('✅ Webhook successfully updated to Grammy endpoint!');
      console.log(`   - New URL: ${webhookUrl}`);
      console.log(`   - Allowed updates: message, callback_query`);
      console.log(`   - Max connections: 40`);
      
      // Проверяем новые настройки
      const newWebhookInfoResponse = await fetch(
        `https://api.telegram.org/bot${token}/getWebhookInfo`
      );
      const newWebhookInfo = await newWebhookInfoResponse.json();
      
      console.log('\n📋 New webhook info:');
      console.log(`   - URL: ${newWebhookInfo.result?.url}`);
      console.log(`   - Has custom certificate: ${newWebhookInfo.result?.has_custom_certificate}`);
      console.log(`   - Pending updates: ${newWebhookInfo.result?.pending_update_count}`);
      
    } else {
      console.error('❌ Failed to setup webhook:', setupResult.description);
    }

    // 6. Тестируем отправку тестового сообщения боту
    console.log('\n💬 Testing bot with test message...');
    console.log('🤖 Now you can send /start to @strattera_test_bot to test Grammy!');
    console.log('📱 Or open WebApp: https://strattera.ngrok.app/webapp');

    console.log('\n🎉 Grammy webhook test completed!');
    console.log('🚀 Ready for production migration to grammY');

  } catch (error) {
    console.error('❌ Grammy webhook test failed:', error);
    
    if (error.message.includes('fetch')) {
      console.log('💡 Make sure your Next.js server is running on port 3000');
      console.log('   Command: PORT=3000 npm run dev');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure ngrok is running:');
      console.log('   Command: ngrok http --domain=strattera.ngrok.app 3000');
    }
    
    throw error;
  }
}

// Запуск теста
if (require.main === module) {
  testGrammyWebhook().catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });
}

export { testGrammyWebhook };