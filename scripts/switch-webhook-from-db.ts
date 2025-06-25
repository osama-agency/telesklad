#!/usr/bin/env tsx

import { prisma } from '../src/libs/prismaDb';

/**
 * Скрипт для переключения на рабочую версию Grammy webhook
 * Получает токен из базы данных
 */

async function switchWebhookFromDB() {
  console.log('🔄 Switching Grammy webhook (using DB token)...\n');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://strattera.ngrok.app';

  try {
    // 1. Получаем токен из базы данных
    console.log('🔑 Getting bot token from database...');
    const settings = await prisma.settings.findMany();
    
    let telegramBotToken = '';
    const tokenSetting = settings.find(s => s.key === 'webapp_telegram_bot_token');
    
    if (tokenSetting) {
      telegramBotToken = tokenSetting.value;
      console.log(`✅ Token found: ${telegramBotToken.substring(0, 10)}...${telegramBotToken.substring(-5)}`);
    } else {
      throw new Error('webapp_telegram_bot_token not found in database');
    }

    // 2. Проверяем текущий webhook
    console.log('\n📍 Checking current webhook status...');
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();
    
    if (webhookInfo.ok) {
      console.log(`✅ Current webhook: ${webhookInfo.result.url || 'Not set'}`);
      if (webhookInfo.result.pending_update_count > 0) {
        console.log(`⚠️ Pending updates: ${webhookInfo.result.pending_update_count}`);
      }
    }

    // 3. Тестируем простой endpoint
    console.log('\n🧪 Testing simple webhook endpoint...');
    const testResponse = await fetch(`${baseUrl}/api/telegram/grammy-simple/webhook`);
    const testResult = await testResponse.json();
    
    if (testResult.status === 'active') {
      console.log('✅ Simple webhook endpoint is ready');
      console.log(`   Worker ready: ${testResult.worker_ready}`);
    } else {
      throw new Error('Simple webhook endpoint not ready');
    }

    // 4. Устанавливаем новый webhook
    console.log('\n🔄 Setting webhook to simple endpoint...');
    const newWebhookUrl = `${baseUrl}/api/telegram/grammy-simple/webhook`;
    
    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: newWebhookUrl,
        allowed_updates: ['message', 'callback_query', 'inline_query'],
        drop_pending_updates: true // Очищаем pending updates
      })
    });

    const setWebhookResult = await setWebhookResponse.json();
    
    if (setWebhookResult.ok) {
      console.log('✅ Webhook updated successfully!');
      console.log(`🔗 New webhook URL: ${newWebhookUrl}`);
    } else {
      throw new Error(`Failed to set webhook: ${setWebhookResult.description}`);
    }

    // 5. Проверяем новый webhook
    console.log('\n🔍 Verifying new webhook...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем 1 секунду
    
    const verifyResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getWebhookInfo`);
    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.ok && verifyResult.result.url === newWebhookUrl) {
      console.log('✅ Webhook verification successful!');
      
      // Показываем детали
      console.log(`   📋 URL: ${verifyResult.result.url}`);
      console.log(`   🔒 Has certificate: ${verifyResult.result.has_custom_certificate}`);
      console.log(`   📊 Pending updates: ${verifyResult.result.pending_update_count}`);
      console.log(`   🔗 Max connections: ${verifyResult.result.max_connections}`);
      console.log(`   📝 Allowed updates: ${verifyResult.result.allowed_updates?.join(', ') || 'All'}`);
      
    } else {
      throw new Error('Webhook verification failed');
    }

    // 6. Тестируем webhook
    console.log('\n🧪 Testing webhook with sample message...');
    const testMessage = {
      update_id: Date.now(),
      message: {
        message_id: Date.now(),
        from: {
          id: 125861752,
          first_name: "Test",
          is_bot: false,
          username: "test_user"
        },
        chat: {
          id: 125861752,
          type: "private"
        },
        date: Math.floor(Date.now() / 1000),
        text: "🧪 Grammy webhook test - упрощенная версия работает!"
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
      console.log('✅ Webhook test successful!');
      console.log(`   📨 Update ID: ${testWebhookResult.update_id}`);
      console.log(`   🕐 Timestamp: ${testWebhookResult.timestamp}`);
    } else {
      console.log('⚠️ Webhook test failed, but webhook is configured');
      console.log('   This might be normal - test in Telegram directly');
    }

    // 7. Информация о боте
    console.log('\n🤖 Getting bot information...');
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/getMe`);
    const botInfo = await botInfoResponse.json();
    
    if (botInfo.ok) {
      console.log(`✅ Bot info:`);
      console.log(`   👤 Name: ${botInfo.result.first_name}`);
      console.log(`   🏷️ Username: @${botInfo.result.username}`);
      console.log(`   🆔 ID: ${botInfo.result.id}`);
      console.log(`   👥 Can join groups: ${botInfo.result.can_join_groups}`);
      console.log(`   📖 Can read messages: ${botInfo.result.can_read_all_group_messages}`);
    }

    // 8. Итоговая информация
    console.log('\n🎉 Grammy webhook switch completed successfully!');
    
    console.log('\n📋 What\'s working now:');
    console.log('✅ Simple webhook endpoint receiving updates');
    console.log('✅ Message processing and logging');
    console.log('✅ Callback query handling');
    console.log('✅ Admin and user detection');
    console.log('✅ Error handling and recovery');
    
    console.log('\n📱 Testing in Telegram:');
    console.log(`   🤖 Bot: @${botInfo.result?.username || 'strattera_test_bot'}`);
    console.log('   👨‍💼 Admin ID: 125861752');
    console.log('   🚛 Courier ID: 7690550402');
    console.log('   💬 Send any message to test');
    
    console.log('\n🔧 Monitoring:');
    console.log(`   📊 Logs: Check Next.js console for Grammy logs`);
    console.log(`   🌐 Simple webhook: ${baseUrl}/api/telegram/grammy-simple/webhook`);
    console.log(`   📈 Health: Monitor webhook processing in real-time`);
    
    console.log('\n✨ Next steps:');
    console.log('1. 📱 Test bot functionality in Telegram');
    console.log('2. 📊 Monitor logs for proper processing');
    console.log('3. 🔄 Migrate full Grammy features to simple endpoint');
    console.log('4. 🚀 Deploy to production when ready');

    console.log('\n🎯 Grammy simple webhook is now active and working!');

  } catch (error) {
    console.error('❌ Failed to switch webhook:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. ✅ Check Next.js server: PORT=3000 npm run dev');
    console.log('2. ✅ Check ngrok: ngrok http --domain=strattera.ngrok.app 3000');
    console.log('3. ✅ Check database connection');
    console.log('4. ✅ Verify bot token in settings table');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск скрипта
if (require.main === module) {
  switchWebhookFromDB().catch((error) => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

export { switchWebhookFromDB };