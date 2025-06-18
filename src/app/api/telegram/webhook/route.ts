import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

// POST - обработка webhook от Telegram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Telegram webhook received:', JSON.stringify(body, null, 2));

    // Обрабатываем callback query (нажатие на кнопки)
    if (body.callback_query) {
      console.log('🔄 Processing callback query:', body.callback_query.data);
      await TelegramBotService.handleCallback(body.callback_query);
      return NextResponse.json({ ok: true });
    }

    // Обрабатываем обычные сообщения (если нужно в будущем)
    if (body.message) {
      console.log('💬 Processing message:', body.message.text);
      // Здесь можно добавить обработку текстовых сообщений
      return NextResponse.json({ ok: true });
    }

    console.log('ℹ️ Unknown webhook type, ignoring');
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('❌ Error processing Telegram webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - проверка работоспособности webhook
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Telegram webhook is ready',
    timestamp: new Date().toISOString()
  });
} 