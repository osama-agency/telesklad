#!/usr/bin/env ts-node

import { TelegramBotWorker } from '../src/lib/services/TelegramBotWorker';

async function setupWebhook() {
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || 'https://strattera.ngrok.app/api/telegram/webhook';
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

  console.log(`🔧 Setting up Telegram webhook...`);
  console.log(`📍 URL: ${webhookUrl}`);
  console.log(`🔐 Secret: ${secretToken ? 'Set' : 'Not set'}`);

  try {
    const worker = TelegramBotWorker.getInstance();
    const result = await worker.setupWebhook(webhookUrl, secretToken);
    
    if (result) {
      console.log('✅ Webhook setup successful!');
      
      // Получаем информацию о webhook
      const info = await worker.getWebhookInfo();
      console.log('📋 Webhook info:', JSON.stringify(info, null, 2));
    } else {
      console.error('❌ Failed to setup webhook');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    process.exit(1);
  }
}

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  setupWebhook();
}

export { setupWebhook };