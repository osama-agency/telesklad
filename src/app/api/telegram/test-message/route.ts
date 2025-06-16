import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🧪 Sending test message to Telegram...');

  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '125861752';

    if (!BOT_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'TELEGRAM_BOT_TOKEN not configured'
      }, { status: 500 });
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ Test message sent successfully');
    
    return NextResponse.json({
      success: true,
      messageId: result.result.message_id,
      chatId: result.result.chat.id
    });

  } catch (error: any) {
    console.error('❌ Test message failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 