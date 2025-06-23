import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/services/TelegramService';

// GET - получить информацию о webapp боте
export async function GET() {
  try {
    // Простая проверка доступности бота
    return NextResponse.json({
      success: true,
      status: 'Bot is working',
      token_preview: '7754514670:AAF***',
      webhook_url: `${process.env.NEXTAUTH_URL || 'https://strattera.ngrok.app'}/api/telegram/webapp-webhook`,
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

    // Отправляем через TelegramService
    const result = await TelegramService.call(testMessage.text, test_user_id);
    
    if (typeof result === 'number') {
      return NextResponse.json({
        success: true,
        message: 'Test message sent successfully',
        message_id: result,
        chat_id: test_user_id
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message || 'Failed to send test message'
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