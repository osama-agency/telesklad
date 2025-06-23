import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotWorker } from '@/lib/services/TelegramBotWorker';
import { prisma } from '@/libs/prismaDb';

// POST - обработка webhook от WEBAPP бота
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 [WEBAPP BOT] Webhook received:', JSON.stringify(body, null, 2));

    // Обрабатываем callback query (нажатие на кнопки заказов)
    if (body.callback_query) {
      console.log('🔄 [WEBAPP BOT] Processing callback:', body.callback_query.data);
      
      if (body.callback_query.data.startsWith('order_')) {
        const worker = TelegramBotWorker.getInstance();
        await worker.processWebhookUpdate(body);
      }
      
      return NextResponse.json({ ok: true });
    }

    // Обрабатываем обычные сообщения (возможно для будущих фич)
    if (body.message) {
      console.log('💬 [WEBAPP BOT] Processing message:', body.message.text);
      
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
              email: `tg_${from.id}@webapp.local`,
              encrypted_password: '',
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        } catch (error) {
          console.error('❌ [WEBAPP BOT] User upsert error:', error);
        }
      }

      // Сохраняем сообщение в базу данных
      if (message.text) {
        try {
          await (prisma as any).messages.create({
            data: {
              text: message.text,
              tg_id: from ? BigInt(from.id) : null,
              is_incoming: true,
              tg_msg_id: BigInt(message.message_id),
              data: message,
              created_at: new Date(message.date * 1000),
              updated_at: new Date(),
            },
          });

          console.log('✅ [WEBAPP BOT] Message saved to DB');
        } catch (error) {
          console.error('❌ [WEBAPP BOT] Message save error:', error);
        }
      }

      return NextResponse.json({ ok: true });
    }

    console.log('ℹ️ [WEBAPP BOT] Unknown webhook type, ignoring');
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('❌ [WEBAPP BOT] Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - проверка работоспособности webapp webhook
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Webapp Telegram webhook is ready',
    bot: 'webapp',
    timestamp: new Date().toISOString()
  });
} 