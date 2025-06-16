import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

// POST - обработка webhook от Telegram
export async function POST(request: NextRequest) {
  console.log('🤖 Telegram webhook received');

  try {
    const body = await request.json();
    console.log('📨 Webhook body:', JSON.stringify(body, null, 2));

    // Обработка callback query (нажатия на кнопки)
    if (body.callback_query) {
      console.log('🔄 Processing callback query');
      const success = await TelegramBotService.handleCallback(body.callback_query);
      
      return NextResponse.json({ 
        success, 
        message: success ? 'Callback processed' : 'Callback processing failed' 
      });
    }

    // Обработка обычных сообщений (если нужно)
    if (body.message) {
      console.log('💬 Processing message from:', body.message.from?.username || body.message.from?.id);
      
      // Здесь можно добавить обработку команд бота
      const text = body.message.text;
      const chatId = body.message.chat.id;
      const userId = body.message.from.id;

      if (text === '/start') {
        // Приветственное сообщение
        console.log('👋 Start command received');
      }

      return NextResponse.json({ success: true, message: 'Message processed' });
    }

    console.log('ℹ️ Unknown webhook type, ignoring');
    return NextResponse.json({ success: true, message: 'Webhook received but not processed' });

  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
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