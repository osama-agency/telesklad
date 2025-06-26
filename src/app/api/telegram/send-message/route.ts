import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { TelegramTokenService } from '@/lib/services/delete/telegram-token.service';

// POST - отправка сообщения в Telegram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, tg_id } = body;

    if (!text || !tg_id) {
      return NextResponse.json(
        { error: 'Text and tg_id are required' },
        { status: 400 }
      );
    }

    // Получаем токен бота из централизованного сервиса
    const botToken = await TelegramTokenService.getTelegramBotToken();
    
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 500 }
      );
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

    // Отправляем сообщение в Telegram
    const telegramResponse = await fetch(`${telegramApiUrl}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: tg_id,
        text: text,
        parse_mode: 'HTML'
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramResult);
      return NextResponse.json(
        { error: 'Failed to send message to Telegram', details: telegramResult },
        { status: 500 }
      );
    }

    // Сохраняем сообщение в базу данных
    const message = await (prisma as any).messages.create({
      data: {
        text: text,
        tg_id: BigInt(tg_id),
        is_incoming: false, // исходящее сообщение
        tg_msg_id: telegramResult.result?.message_id ? BigInt(telegramResult.result.message_id) : null,
        data: telegramResult.result,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Преобразуем BigInt в строки для JSON
    const serializedMessage = {
      ...message,
      id: message.id.toString(),
      tg_id: message.tg_id ? message.tg_id.toString() : null,
      tg_msg_id: message.tg_msg_id ? message.tg_msg_id.toString() : null,
    };

    console.log('✅ Message sent to Telegram and saved to DB:', serializedMessage.id);

    return NextResponse.json({
      success: true,
      message: serializedMessage,
      telegram_response: telegramResult
    });

  } catch (error) {
    console.error('❌ Error sending message to Telegram:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 