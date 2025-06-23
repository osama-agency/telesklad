#!/usr/bin/env ts-node

import { TelegramBotWorker } from '../src/lib/services/TelegramBotWorker';

async function getWebhookInfo() {
  console.log('📋 Getting Telegram webhook info...');

  try {
    const worker = TelegramBotWorker.getInstance();
    const info = await worker.getWebhookInfo();
    
    if (info) {
      console.log('✅ Webhook info retrieved:');
      console.log(JSON.stringify(info, null, 2));
    } else {
      console.error('❌ Failed to get webhook info');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error getting webhook info:', error);
    process.exit(1);
  }
}

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  getWebhookInfo();
}

export { getWebhookInfo };