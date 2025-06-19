import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

// GET - получение сообщений
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметры
    const tg_id = searchParams.get('tg_id'); // фильтр по пользователю
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Фильтры
    const where: any = {};
    if (tg_id) {
      where.tg_id = BigInt(tg_id);
    }

    // Получаем сообщения
    const [messages, totalCount] = await Promise.all([
      (prisma as any).messages.findMany({
        where,
        orderBy: { created_at: 'asc' }, // Изменено на asc для хронологического порядка
        skip: offset,
        take: limit,
      }),
      (prisma as any).messages.count({ where }),
    ]);

    // Получаем уникальные Telegram ID для группировки по пользователям
    const uniqueUsers = await (prisma as any).messages.groupBy({
      by: ['tg_id'],
      where: { tg_id: { not: null } },
      _count: { id: true },
      _max: { created_at: true },
      orderBy: { _max: { created_at: 'desc' } }
    });

    // Получаем данные пользователей с информацией о заказах
    const usersWithOrders = await Promise.all(
      uniqueUsers.map(async (userGroup: any) => {
        const user = await (prisma as any).users.findUnique({
          where: { tg_id: userGroup.tg_id },
          select: {
            id: true,
            tg_id: true,
            first_name: true,
            last_name: true,
            username: true,
            orders: {
              select: {
                id: true,
                status: true,
                total_amount: true,
                created_at: true
              }
            }
          }
        });

        if (!user) {
          return {
            tg_id: userGroup.tg_id ? userGroup.tg_id.toString() : null,
            messageCount: userGroup._count.id,
            lastMessageAt: userGroup._max.created_at,
            first_name: null,
            last_name: null,
            username: null,
            orderStats: {
              totalOrders: 0,
              deliveredOrders: 0,
              totalSpent: '0',
              hasOrders: false,
              clientStatus: 'new' // new, potential, active
            }
          };
        }

        // Статистика заказов
        const totalOrders = user.orders.length;
        const deliveredOrders = user.orders.filter((order: any) => order.status === 4).length;
        const totalSpent = user.orders
          .filter((order: any) => order.status === 4)
          .reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);

        let clientStatus = 'new';
        if (deliveredOrders > 0) {
          clientStatus = 'active';
        } else if (totalOrders > 0) {
          clientStatus = 'potential';
        }

        return {
          tg_id: user.tg_id.toString(),
          messageCount: userGroup._count.id,
          lastMessageAt: userGroup._max.created_at,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          orderStats: {
            totalOrders,
            deliveredOrders,
            totalSpent: totalSpent.toString(),
            hasOrders: totalOrders > 0,
            clientStatus
          }
        };
      })
    );

    // Преобразуем BigInt в строки
    const serializedMessages = messages.map((message: any) => ({
      ...message,
      id: message.id.toString(),
      tg_id: message.tg_id ? message.tg_id.toString() : null,
      tg_msg_id: message.tg_msg_id ? message.tg_msg_id.toString() : null,
    }));

    return NextResponse.json({
      messages: serializedMessages,
      users: usersWithOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - отправка нового сообщения
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const message = await (prisma as any).messages.create({
      data: {
        text: body.text,
        tg_id: body.tg_id ? BigInt(body.tg_id) : null,
        is_incoming: body.is_incoming || false, // исходящее по умолчанию
        data: body.data || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Преобразуем BigInt в строки
    const serializedMessage = {
      ...message,
      id: message.id.toString(),
      tg_id: message.tg_id ? message.tg_id.toString() : null,
      tg_msg_id: message.tg_msg_id ? message.tg_msg_id.toString() : null,
    };

    return NextResponse.json(serializedMessage);

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 