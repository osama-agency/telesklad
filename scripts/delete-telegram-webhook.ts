#!/usr/bin/env ts-node

import { TelegramBotWorker } from '../src/lib/services/TelegramBotWorker';

async function deleteWebhook() {
  console.log('🗑️ Deleting Telegram webhook...');

  try {
    const worker = TelegramBotWorker.getInstance();
    const result = await worker.deleteWebhook();
    
    if (result) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      console.error('❌ Failed to delete webhook');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error);
    process.exit(1);
  }
}

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  deleteWebhook();
}

export { deleteWebhook };