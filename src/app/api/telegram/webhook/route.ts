import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TelegramBotWorker } from '@/lib/services/TelegramBotWorker';
import crypto from 'crypto';

// Получаем экземпляр воркера
const botWorker = TelegramBotWorker.getInstance();

// Флаг инициализации
let isInitialized = false;

// Инициализируем бота при первом запросе
async function ensureBotInitialized() {
  if (!isInitialized) {
    try {
      await botWorker.initialize();
      isInitialized = true;
      console.log('✅ Telegram bot initialized in webhook handler');
    } catch (error) {
      console.error('❌ Failed to initialize bot:', error);
      throw error;
    }
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Проверка подписи webhook от Telegram
 */
function verifyTelegramWebhook(secretToken: string, requestBody: string, telegramSignature: string): boolean {
  const hash = crypto.createHmac('sha256', secretToken).update(requestBody).digest('hex');
  return `sha256=${hash}` === telegramSignature;
}

export async function POST(request: NextRequest) {
  try {
    // Инициализируем бота если еще не инициализирован
    await ensureBotInitialized();
    
    const headersList = await headers();
    const telegramSignature = headersList.get('x-telegram-bot-api-secret-token');
    
    // Получаем тело запроса как текст для проверки подписи
    const requestBody = await request.text();
    
    // Проверяем секретный токен если он настроен
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secretToken && telegramSignature) {
      const isValid = verifyTelegramWebhook(secretToken, requestBody, telegramSignature);
      if (!isValid) {
        console.warn('⚠️ Invalid webhook signature');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Парсим JSON
    const update = JSON.parse(requestBody);
    
    // Логируем входящее обновление
    console.log('📨 Telegram webhook update:', JSON.stringify(update, null, 2));
    
    // Обрабатываем update через worker
    await botWorker.processWebhookUpdate(update);
    
    // Telegram ожидает статус 200 и любой ответ
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('❌ Telegram webhook error:', error);
    
    // Важно: возвращаем 200 даже при ошибке, чтобы Telegram не повторял запрос
    return NextResponse.json({ ok: false });
  }
}

// GET - проверка работоспособности webhook
export async function GET() {
  try {
    // Инициализируем бота если еще не инициализирован
    await ensureBotInitialized();
    
    // Можно добавить проверку статуса воркера
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Telegram webhook is ready',
      timestamp: new Date().toISOString(),
      mode: 'webhook',
      initialized: isInitialized
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 