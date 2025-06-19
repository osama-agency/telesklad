import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';
import { prisma } from '@/libs/prismaDb';

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

    // Обрабатываем обычные сообщения
    if (body.message) {
      console.log('💬 Processing message:', body.message.text);
      
      const message = body.message;
      const from = message.from;
      
      // Сохраняем пользователя если его нет в базе
      if (from) {
        try {
          await (prisma as any).users.upsert({
            where: { tg_id: BigInt(from.id) },
            update: {
              first_name: from.first_name || null,
              last_name: from.last_name || null,
              username: from.username || null,
              updated_at: new Date(),
            },
            create: {
              tg_id: BigInt(from.id),
              first_name: from.first_name || null,
              last_name: from.last_name || null,
              username: from.username || null,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        } catch (error) {
          console.error('Error upserting user:', error);
        }
      }

      // Сохраняем сообщение в базу данных
      if (message.text) {
        try {
          const savedMessage = await (prisma as any).messages.create({
            data: {
              text: message.text,
              tg_id: from ? BigInt(from.id) : null,
              is_incoming: true, // входящее сообщение
              tg_msg_id: BigInt(message.message_id),
              data: message,
              created_at: new Date(message.date * 1000), // Telegram timestamp в секундах
              updated_at: new Date(),
            },
          });
          
          console.log('✅ Message saved to DB:', savedMessage.id.toString());
        } catch (error) {
          console.error('❌ Error saving message to DB:', error);
        }
      }

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