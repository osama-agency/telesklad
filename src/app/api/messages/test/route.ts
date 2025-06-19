import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

// POST - создание тестовых сообщений
export async function POST() {
  try {
    const testMessages = [
      {
        text: 'Привет! Хочу заказать товар',
        tg_id: BigInt('123456789'),
        is_incoming: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 часа назад
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        text: 'Добро пожаловать! Что вас интересует?',
        tg_id: BigInt('123456789'),
        is_incoming: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5), // 1ч 55мин назад
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5),
      },
      {
        text: 'Мне нужны витамины для иммунитета',
        tg_id: BigInt('123456789'),
        is_incoming: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 час назад
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1),
      },
      {
        text: 'Рекомендую витамин C и D3. Могу подобрать оптимальный вариант',
        tg_id: BigInt('123456789'),
        is_incoming: false,
        created_at: new Date(Date.now() - 1000 * 60 * 50), // 50 минут назад
        updated_at: new Date(Date.now() - 1000 * 60 * 50),
      },
      {
        text: 'Сколько будет стоить?',
        tg_id: BigInt('123456789'),
        is_incoming: true,
        created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 минут назад
        updated_at: new Date(Date.now() - 1000 * 60 * 30),
      },
      // Второй пользователь
      {
        text: 'Здравствуйте! Есть ли у вас скидки?',
        tg_id: BigInt('987654321'),
        is_incoming: true,
        created_at: new Date(Date.now() - 1000 * 60 * 45), // 45 минут назад
        updated_at: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        text: 'Да, для постоянных клиентов действует скидка 10%',
        tg_id: BigInt('987654321'),
        is_incoming: false,
        created_at: new Date(Date.now() - 1000 * 60 * 40), // 40 минут назад
        updated_at: new Date(Date.now() - 1000 * 60 * 40),
      },
      {
        text: 'Отлично! Хочу оформить заказ',
        tg_id: BigInt('987654321'),
        is_incoming: true,
        created_at: new Date(Date.now() - 1000 * 60 * 10), // 10 минут назад
        updated_at: new Date(Date.now() - 1000 * 60 * 10),
      },
      // Третий пользователь
      {
        text: 'Подскажите, когда будет доставка?',
        tg_id: BigInt('555666777'),
        is_incoming: true,
        created_at: new Date(Date.now() - 1000 * 60 * 20), // 20 минут назад
        updated_at: new Date(Date.now() - 1000 * 60 * 20),
      },
    ];

    // Создаём тестовые сообщения
    for (const message of testMessages) {
      await (prisma as any).messages.create({
        data: message,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Тестовые сообщения созданы',
      count: testMessages.length 
    });

  } catch (error) {
    console.error('Error creating test messages:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - удаление всех тестовых сообщений
export async function DELETE() {
  try {
    const result = await (prisma as any).messages.deleteMany({
      where: {
        tg_id: {
          in: [BigInt('123456789'), BigInt('987654321'), BigInt('555666777')]
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Тестовые сообщения удалены',
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Error deleting test messages:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 