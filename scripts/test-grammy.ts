#!/usr/bin/env tsx

import { Bot } from 'grammy';
import { TelegramTokenService } from '../src/lib/services/telegram-token.service';

/**
 * Тестовый скрипт для проверки работы grammY
 * Проверяет подключение к Telegram API и базовую функциональность
 */
async function testGrammy() {
  console.log('🧪 Testing grammY integration...\n');

  try {
    // Получаем токен для тестирования
    const token = await TelegramTokenService.getWebappBotToken();
    if (!token) {
      console.error('❌ No webapp telegram bot token found');
      console.log('💡 Make sure WEBAPP_TELEGRAM_BOT_TOKEN is set in .env.local');
      return;
    }

    console.log('✅ Token loaded successfully');

    // Создаем экземпляр бота
    const bot = new Bot(token);
    console.log('✅ grammY Bot instance created');

    // Тестируем подключение к API
    const botInfo = await bot.api.getMe();
    console.log('✅ Connected to Telegram API successfully');
    console.log('🤖 Bot info:');
    console.log(`   - Name: ${botInfo.first_name}`);
    console.log(`   - Username: @${botInfo.username}`);
    console.log(`   - ID: ${botInfo.id}`);
    console.log(`   - Can join groups: ${botInfo.can_join_groups}`);
    console.log(`   - Can read all group messages: ${botInfo.can_read_all_group_messages}`);
    console.log(`   - Supports inline queries: ${botInfo.supports_inline_queries}`);

    // Тестируем получение webhook info
    try {
      const webhookInfo = await bot.api.getWebhookInfo();
      console.log('\n📡 Webhook info:');
      console.log(`   - URL: ${webhookInfo.url || 'Not set'}`);
      console.log(`   - Has custom certificate: ${webhookInfo.has_custom_certificate}`);
      console.log(`   - Pending update count: ${webhookInfo.pending_update_count}`);
      console.log(`   - Max connections: ${webhookInfo.max_connections}`);
      console.log(`   - Allowed updates: ${webhookInfo.allowed_updates?.join(', ') || 'All'}`);
    } catch (webhookError) {
      console.log('ℹ️  Webhook info not available (normal for first run)');
    }

    console.log('\n🎉 grammY test completed successfully!');
    console.log('🚀 Ready to start migration to grammY');

  } catch (error) {
    console.error('❌ grammY test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.log('💡 This is likely an invalid token issue');
        console.log('   Check your WEBAPP_TELEGRAM_BOT_TOKEN in .env.local');
      } else if (error.message.includes('network')) {
        console.log('💡 This might be a network connectivity issue');
        console.log('   Check your internet connection');
      }
    }
    
    throw error;
  }
}

// Запуск теста
if (require.main === module) {
  testGrammy().catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });
}

export { testGrammy };