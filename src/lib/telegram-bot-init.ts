import { TelegramBotWorker } from './services/TelegramBotWorker';

/**
 * Инициализация Telegram бота при старте приложения
 * Используется только webhook режим
 */
export async function initializeTelegramBot(): Promise<void> {
  try {
    console.log('🤖 Initializing Telegram bot...');
    
    const worker = TelegramBotWorker.getInstance();
    await worker.initialize();
    
    console.log('✅ Telegram bot initialized successfully in webhook mode');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error);
    // В разработке не критично, в продакшене стоит уведомить
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Bot initialization failed in production!');
    }
  }
}

/**
 * Настройка webhook при деплое
 */
export async function setupWebhookOnDeploy(): Promise<void> {
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('⚠️ TELEGRAM_WEBHOOK_URL not set, skipping webhook setup');
    return;
  }

  try {
    console.log('🔧 Setting up webhook on deploy...');
    
    const worker = TelegramBotWorker.getInstance();
    await worker.initialize();
    
    const result = await worker.setupWebhook(
      webhookUrl, 
      process.env.TELEGRAM_WEBHOOK_SECRET
    );
    
    if (result) {
      console.log('✅ Webhook setup completed on deploy');
    } else {
      console.error('❌ Failed to setup webhook on deploy');
    }
  } catch (error) {
    console.error('❌ Error setting up webhook on deploy:', error);
  }
}