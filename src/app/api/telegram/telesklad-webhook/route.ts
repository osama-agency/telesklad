import { NextResponse } from 'next/server';
import { TelegramBotWorker } from '@/lib/services/TelegramBotWorker';
import { TelegramTokenService } from '@/lib/services/telegram-token.service';

const TELESKLAD_BOT_ID = 7612206140; // @telesklad_bot

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
      console.log('✅ Telesklad bot initialized in webhook handler');
    } catch (error) {
      console.error('❌ Failed to initialize telesklad bot:', error);
      throw error;
    }
  }
}

export async function POST(request: Request) {
  try {
    // Инициализируем бота при необходимости
    await ensureBotInitialized();

    const update = await request.json();
    
    // Логируем входящий запрос для отладки
    console.log('📨 [TELESKLAD BOT] Webhook received:', JSON.stringify(update, null, 2));

    // Обрабатываем обновление (убираем проверку ID пользователя)
    await botWorker.processWebhookUpdate(update);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ Error processing telesklad bot webhook:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
} 