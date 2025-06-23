import { PrismaClient } from '@prisma/client';
import { TelegramBotWorker } from '../src/lib/services/telegram-bot-worker.service';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function switchBotMode(mode: 'production' | 'test') {
  try {
    console.log(`🔄 Switching to ${mode} bot mode...`);
    
    // Получаем токены
    const tgTokenSetting = await prisma.settings.findFirst({
      where: { variable: 'tg_token' }
    });
    
    const webappTokenSetting = await prisma.settings.findFirst({
      where: { variable: 'webapp_telegram_bot_token' }
    });
    
    if (!tgTokenSetting?.value || !webappTokenSetting?.value) {
      console.error('❌ Bot tokens not found in database');
      return;
    }
    
    const token = mode === 'production' ? tgTokenSetting.value : webappTokenSetting.value;
    const botName = mode === 'production' ? '@strattera_bot' : '@strattera_test_bot';
    
    // Удаляем существующий webhook
    console.log('🗑️ Removing existing webhook...');
    const bot = TelegramBotWorker.getInstance();
    await bot.deleteWebhook();
    
    if (mode === 'production') {
      // Продакшен бот должен работать на старом сервере
      console.log('✅ Production bot cleared. It should work on the old Rails server.');
      console.log('📌 Production bot:', botName);
      console.log('📌 Webhook should be set to Rails server URL');
    } else {
      // Тестовый бот работает локально в режиме polling
      console.log('✅ Test bot configured for local development');
      console.log('📌 Test bot:', botName);
      console.log('📌 Mode: Polling (local development)');
      console.log('');
      console.log('To use webhook with ngrok:');
      console.log('1. Run: ngrok http --domain=strattera.ngrok.app 3000');
      console.log('2. Run: npm run telegram:webhook:setup');
    }
    
    console.log('');
    console.log('🎯 Current configuration:');
    console.log(`NODE_ENV=${process.env.NODE_ENV || 'development'}`);
    console.log(`Active bot: ${botName}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Получаем режим из аргументов командной строки
const mode = process.argv[2] as 'production' | 'test';

if (!mode || !['production', 'test'].includes(mode)) {
  console.error('Usage: tsx scripts/switch-bot-mode.ts [production|test]');
  process.exit(1);
}

switchBotMode(mode); 