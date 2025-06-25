#!/usr/bin/env tsx

import { prisma } from '../src/libs/prismaDb';

async function checkSettings() {
  console.log('🔍 Checking settings in database...\n');

  try {
    const settings = await prisma.settings.findMany();
    
    console.log(`📋 Found ${settings.length} settings in database:`);
    
    settings.forEach((setting, index) => {
      console.log(`${index + 1}. ${setting.key}: ${setting.value.substring(0, 50)}${setting.value.length > 50 ? '...' : ''}`);
    });

    // Ищем telegram-related настройки
    const telegramSettings = settings.filter(s => 
      s.key.toLowerCase().includes('telegram') || 
      s.key.toLowerCase().includes('bot') ||
      s.key.toLowerCase().includes('token')
    );

    if (telegramSettings.length > 0) {
      console.log('\n🤖 Telegram-related settings:');
      telegramSettings.forEach(setting => {
        console.log(`   ${setting.key}: ${setting.value.substring(0, 20)}...`);
      });
    }

    // Проверяем переменные окружения
    console.log('\n🌍 Environment variables:');
    const envVars = [
      'WEBAPP_TELEGRAM_BOT_TOKEN',
      'TELESKLAD_BOT_TOKEN', 
      'STRATTERA_BOT_TOKEN',
      'TELEGRAM_BOT_TOKEN'
    ];

    envVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`   ${envVar}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`   ${envVar}: not set`);
      }
    });

    // Пытаемся найти любой токен
    const allTokens = [
      ...telegramSettings.map(s => ({ source: 'DB', key: s.key, value: s.value })),
      ...envVars.filter(env => process.env[env]).map(env => ({ 
        source: 'ENV', 
        key: env, 
        value: process.env[env] 
      }))
    ];

    if (allTokens.length > 0) {
      console.log('\n🔑 Available tokens:');
      allTokens.forEach(token => {
        console.log(`   [${token.source}] ${token.key}: ${token.value.substring(0, 15)}...`);
      });

      // Используем первый найденный токен для теста
      const testToken = allTokens[0].value;
      console.log(`\n🧪 Testing first available token...`);
      
      try {
        const botInfoResponse = await fetch(`https://api.telegram.org/bot${testToken}/getMe`);
        const botInfo = await botInfoResponse.json();
        
        if (botInfo.ok) {
          console.log(`✅ Token works! Bot: @${botInfo.result.username} (${botInfo.result.first_name})`);
          
          // Проверяем текущий webhook
          const webhookResponse = await fetch(`https://api.telegram.org/bot${testToken}/getWebhookInfo`);
          const webhookInfo = await webhookResponse.json();
          
          if (webhookInfo.ok) {
            console.log(`📍 Current webhook: ${webhookInfo.result.url || 'Not set'}`);
          }
          
        } else {
          console.log(`❌ Token test failed: ${botInfo.description}`);
        }
      } catch (error) {
        console.log(`❌ Token test error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск
if (require.main === module) {
  checkSettings().catch((error) => {
    console.error('💥 Check failed:', error.message);
    process.exit(1);
  });
}