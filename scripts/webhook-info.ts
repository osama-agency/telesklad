#!/usr/bin/env ts-node

import { TelegramBotWorker } from '../src/lib/services/TelegramBotWorker';

async function getWebhookInfo() {
  console.log('🌐 Получение информации о webhook...');

  try {
    const worker = TelegramBotWorker.getInstance();
    const info = await worker.getWebhookInfo();
    
    if (info) {
      console.log('✅ Webhook информация получена:');
      console.log('📋 Детали:', JSON.stringify(info, null, 2));
      
      if (info.url) {
        console.log(`🔗 URL: ${info.url}`);
        console.log(`📊 Ожидающих обновлений: ${info.pending_update_count}`);
        console.log(`🔒 IP адрес: ${info.ip_address || 'Не указан'}`);
        console.log(`⏰ Последняя ошибка: ${info.last_error_date || 'Нет'}`);
        
        if (info.last_error_message) {
          console.log(`❌ Сообщение ошибки: ${info.last_error_message}`);
        }
      } else {
        console.log('⚠️ Webhook не установлен');
      }
    } else {
      console.error('❌ Не удалось получить информацию о webhook');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Ошибка получения информации о webhook:', error);
    process.exit(1);
  }
}

getWebhookInfo(); 