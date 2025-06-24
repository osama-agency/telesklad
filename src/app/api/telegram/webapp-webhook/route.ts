import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotWorker } from '@/lib/services/TelegramBotWorker';
import { TelegramService } from '@/lib/services/TelegramService';
import { prisma } from '@/libs/prismaDb';

const STRATTERA_TEST_BOT_ID = 7754514670; // @strattera_test_bot

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
      console.log('✅ Strattera test bot initialized in webhook handler');
    } catch (error) {
      console.error('❌ Failed to initialize strattera test bot:', error);
      throw error;
    }
  }
}

// POST - обработка webhook от WEBAPP бота
export async function POST(request: NextRequest) {
  try {
    // Инициализируем бота при необходимости
    await ensureBotInitialized();

    const body = await request.json();
    console.log('📨 [WEBAPP BOT] Webhook received:', JSON.stringify(body, null, 2));

    // Для обычных сообщений проверяем bot ID (но НЕ для callback_query)
    if (body?.message?.from?.is_bot && body?.message?.from?.id !== STRATTERA_TEST_BOT_ID) {
      console.warn('⚠️ Received message from wrong bot ID:', body?.message?.from?.id);
      return NextResponse.json({ ok: false, error: 'Wrong bot ID' }, { status: 403 });
    }

    // Обрабатываем callback query (нажатие на кнопки)
    if (body.callback_query) {
      console.log('🔄 [WEBAPP BOT] Processing callback from user:', body.callback_query.from.id, 'data:', body.callback_query.data);
      
      // Обрабатываем все callback'и через TelegramBotWorker
      await botWorker.processWebhookUpdate(body);
      
      return NextResponse.json({ ok: true });
    }

    // Обрабатываем обычные сообщения
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

      // 🆕 ОТПРАВЛЯЕМ ПРИВЕТСТВЕННЫЕ СООБЩЕНИЯ с кнопками через TelegramBotWorker
      if (from && message.text) {
        try {
          console.log('🎉 [WEBAPP BOT] Sending welcome message to:', from.id);
          
          // Логируем тип сообщения
          if (message.text.trim() === '/start') {
            console.log('🎉 [WEBAPP BOT] Sending welcome message for /start');
          } else {
            console.log('📧 [WEBAPP BOT] Sending auto-reply');
          }

          // ИСПРАВЛЕНО: Используем TelegramBotWorker.processWebhookUpdate для полной обработки
          // Это обеспечит правильную отправку приветственного сообщения с кнопками
          await botWorker.processWebhookUpdate(body);
          console.log('✅ [WEBAPP BOT] Welcome message sent successfully');

        } catch (replyError) {
          console.error('❌ [WEBAPP BOT] Welcome message error:', replyError);
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