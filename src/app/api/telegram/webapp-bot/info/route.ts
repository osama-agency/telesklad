import { NextRequest, NextResponse } from 'next/server';
import { WebappTelegramBotService } from '@/lib/services/webapp-telegram-bot.service';

// GET - получить информацию о webapp боте
export async function GET() {
  try {
    const botInfo = await WebappTelegramBotService.getBotInfo();
    
    if (botInfo.error) {
      return NextResponse.json({
        success: false,
        error: botInfo.error,
        status: 'Bot connection failed'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bot: botInfo.result,
      status: 'Bot is working',
      token_preview: '7754514670:AAF***',
      webhook_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3009'}/api/telegram/webapp-webhook`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Bot info error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'Bot info failed'
    }, { status: 500 });
  }
}

// POST - отправить тестовое сообщение
export async function POST(request: NextRequest) {
  try {
    const { test_user_id, message } = await request.json();
    
    if (!test_user_id) {
      return NextResponse.json({
        success: false,
        error: 'test_user_id is required'
      }, { status: 400 });
    }

    // Отправляем тестовое сообщение
    const testMessage = {
      chat_id: test_user_id,
      text: message || `🧪 <b>Тестовое сообщение от webapp бота</b>

Бот работает корректно!
Время: ${new Date().toLocaleString('ru-RU')}`,
      parse_mode: 'HTML' as const
    };

    // Используем приватный метод sendMessage через рефлексию (для тестирования)
    const result = await (WebappTelegramBotService as any).sendMessage(testMessage);
    
    if (result && result.result) {
      return NextResponse.json({
        success: true,
        message: 'Test message sent successfully',
        message_id: result.result.message_id,
        chat_id: result.result.chat.id
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result?.error || 'Failed to send test message'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test message error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 