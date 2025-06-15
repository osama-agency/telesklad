import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

// POST - обработка webhook от Telegram
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    console.log('Telegram webhook received:', JSON.stringify(update, null, 2));
    
    // Обработка callback query (нажатие на inline кнопки)
    if (update.callback_query) {
      const handled = await TelegramBotService.handleCallback(update.callback_query);
      
      if (handled) {
        return NextResponse.json({ ok: true });
      } else {
        console.warn('Unhandled callback query:', update.callback_query.data);
        return NextResponse.json({ ok: true, warning: 'Unhandled callback' });
      }
    }
    
    // Обработка обычных сообщений (если нужно)
    if (update.message) {
      // Здесь можно добавить обработку текстовых команд
      console.log('Message received:', update.message.text);
      return NextResponse.json({ ok: true });
    }
    
    // Неизвестный тип обновления
    console.log('Unknown update type:', Object.keys(update));
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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