#!/usr/bin/env node

/**
 * Скрипт для удаления webhook с продакшн бота @strattera_bot
 * Это освободит бота для работы с Rails приложением на сервере
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function removeProductionWebhook() {
  try {
    console.log('🔍 Ищу токен продакшн бота @strattera_bot в базе данных...');
    
    // Получаем токен основного продакшн бота из базы данных
    const mainBotSetting = await prisma.settings.findFirst({
      where: { variable: 'tg_token' }
    });
    
    if (!mainBotSetting || !mainBotSetting.value) {
      console.error('❌ Токен основного бота (tg_token) не найден в базе данных');
      process.exit(1);
    }
    
    const productionToken = mainBotSetting.value;
    console.log(`✅ Найден токен: ${productionToken.substring(0, 10)}...${productionToken.slice(-4)}`);
    
    // Проверяем информацию о боте
    console.log('🤖 Проверяю информацию о боте...');
    const botInfoResponse = await axios.get(`https://api.telegram.org/bot${productionToken}/getMe`);
    
    if (botInfoResponse.data.ok) {
      const botInfo = botInfoResponse.data.result;
      console.log(`📱 Бот: @${botInfo.username} (ID: ${botInfo.id})`);
      console.log(`📝 Имя: ${botInfo.first_name}`);
    } else {
      console.error('❌ Не удалось получить информацию о боте:', botInfoResponse.data.description);
      process.exit(1);
    }
    
    // Проверяем текущий webhook
    console.log('🌐 Проверяю текущий webhook...');
    const webhookInfoResponse = await axios.get(`https://api.telegram.org/bot${productionToken}/getWebhookInfo`);
    
    if (webhookInfoResponse.data.ok) {
      const webhookInfo = webhookInfoResponse.data.result;
      if (webhookInfo.url) {
        console.log(`🔗 Текущий webhook: ${webhookInfo.url}`);
        console.log(`📊 Ожидающих обновлений: ${webhookInfo.pending_update_count}`);
        
        if (webhookInfo.url.includes('ngrok.app') || webhookInfo.url.includes('localhost')) {
          console.log('⚠️  Webhook указывает на локальную разработку - нужно удалить!');
        }
      } else {
        console.log('✅ Webhook не установлен');
        console.log('✅ Бот готов к работе с Rails приложением');
        return;
      }
    }
    
    // Удаляем webhook
    console.log('🗑️  Удаляю webhook с продакшн бота...');
    const deleteResponse = await axios.post(`https://api.telegram.org/bot${productionToken}/deleteWebhook`, {
      drop_pending_updates: true
    });
    
    if (deleteResponse.data.ok) {
      console.log('✅ Webhook успешно удален!');
      console.log('✅ Бот @strattera_bot теперь свободен для работы с Rails приложением');
      console.log('');
      console.log('📋 Следующие шаги:');
      console.log('1. Rails приложение должно установить свой webhook');
      console.log('2. Проверьте, что Rails сервер запущен и доступен');
      console.log('3. Убедитесь, что база данных синхронизирована между проектами');
    } else {
      console.error('❌ Ошибка при удалении webhook:', deleteResponse.data.description);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('📝 Ответ API:', error.response.data);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
removeProductionWebhook(); 