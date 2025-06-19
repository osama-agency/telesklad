import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { OrderFilters } from '@/types/order';
import { Prisma } from '@prisma/client';

// GET - получение списка заказов с фильтрацией
export async function GET(request: NextRequest) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    const { searchParams } = new URL(request.url);
    
    // Параметры фильтрации
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const customerCity = searchParams.get('customerCity') || undefined;
    const currency = searchParams.get('currency') || undefined;
    const isPaid = searchParams.get('isPaid');
    const isShipped = searchParams.get('isShipped');
    const minTotal = searchParams.get('minTotal');
    const maxTotal = searchParams.get('maxTotal');
    
    // Параметры пагинации
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;
    
    // Параметры сортировки
    const sortBy = searchParams.get('sortBy') || 'orderdate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Параметры даты из DateRangeContext
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Строим фильтры
    const where: any = {};

    if (search) {
      where.OR = [
        { customername: { contains: search, mode: 'insensitive' } },
        { customeremail: { contains: search, mode: 'insensitive' } },
        { customerphone: { contains: search, mode: 'insensitive' } },
        { externalid: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      const statusNum = parseInt(status);
      if (!isNaN(statusNum)) {
        where.status = statusNum;
      }
    }

    if (customerCity) {
      where.customercity = { equals: customerCity, mode: 'insensitive' };
    }

    if (currency) {
      where.currency = currency;
    }

    if (isPaid === 'true') {
      where.paid_at = { not: null };
    } else if (isPaid === 'false') {
      where.paid_at = null;
    }

    if (isShipped === 'true') {
      where.shipped_at = { not: null };
    } else if (isShipped === 'false') {
      where.shipped_at = null;
    }

    if (minTotal) {
      where.total_amount = { ...where.total_amount, gte: parseFloat(minTotal) };
    }

    if (maxTotal) {
      where.total_amount = { ...where.total_amount, lte: parseFloat(maxTotal) };
    }

    // Фильтрация по дате: используем paid_at, если null то created_at
    if (from || to) {
      const dateConditions = [];
      
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        
        dateConditions.push({
          OR: [
            {
              paid_at: {
                not: null,
                gte: fromDate
              }
            },
            {
              AND: [
                { paid_at: null },
                { created_at: { gte: fromDate } }
              ]
            }
          ]
        });
      }
      
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        
        dateConditions.push({
          OR: [
            {
              paid_at: {
                not: null,
                lte: toDate
              }
            },
            {
              AND: [
                { paid_at: null },
                { created_at: { lte: toDate } }
              ]
            }
          ]
        });
      }
      
      if (dateConditions.length > 0) {
        where.AND = (where.AND || []).concat(dateConditions);
      }
    }

    // Определяем поле для сортировки
    const orderBy: any = {};
    switch (sortBy) {
      case 'customername':
        orderBy.customername = sortOrder;
        break;
      case 'status':
        orderBy.status = sortOrder;
        break;
      case 'total_amount':
        orderBy.total_amount = sortOrder;
        break;
      case 'created_at':
        orderBy.created_at = sortOrder;
        break;
      case 'orderdate':
        // Сортируем по paid_at, если null то по created_at
        orderBy.paid_at = sortOrder;
        break;
      default:
        // По умолчанию сортируем по created_at (дата создания заказа)
        orderBy.created_at = sortOrder;
    }

    console.log('Query params:', {
      where,
      orderBy,
      skip: offset,
      take: limit
    });

    // Получаем заказы
    const [orders, totalCount] = await Promise.all([
      (prisma as any).orders.findMany({
        where,
        include: {
          order_items: {
            orderBy: {
              created_at: 'asc'
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      (prisma as any).orders.count({ where }),
    ]);

    // Расчет статистики
    const stats = await (prisma as any).orders.aggregate({
      where,
      _sum: {
        total_amount: true,
        deliverycost: true,
        bonus: true,
      },
      _avg: {
        total_amount: true,
      },
    });

    // Дополнительная статистика
    const additionalStats = await Promise.all([
      // Количество уникальных городов
      (prisma as any).orders.groupBy({
        by: ['customercity'],
        where: {
          ...where,
          customercity: { not: null }
        },
        _count: true,
      }),
      // Количество заказов с отслеживанием
      (prisma as any).orders.count({
        where: {
          ...where,
          tracking_number: { not: null }
        }
      }),
      // Количество оплаченных заказов
      (prisma as any).orders.count({
        where: {
          ...where,
          paid_at: { not: null }
        }
      }),
      // Количество отправленных заказов
      (prisma as any).orders.count({
        where: {
          ...where,
          shipped_at: { not: null }
        }
      }),
    ]);

    const [uniqueCities, ordersWithTracking, paidOrders, shippedOrders] = additionalStats;

    // Получаем уникальные user_id для загрузки пользователей
    const userIds = [...new Set(orders.map((order: any) => order.user_id).filter(Boolean))];
    
    // Загружаем пользователей отдельно
    let users: any[] = [];
    if (userIds.length > 0) {
      try {
        users = await (prisma as any).users.findMany({
          where: {
            id: {
              in: userIds
            }
          },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            phone_number: true,
            username: true,
          }
        });
      } catch (error) {
        console.log('Could not load users:', error);
        // Пробуем другое название таблицы
        try {
          users = await (prisma as any).telesklad_users.findMany({
            where: {
              id: {
                in: userIds
              }
            },
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              phone_number: true,
              username: true,
            }
          });
        } catch (error2) {
          console.log('Could not load telesklad_users either:', error2);
        }
      }
    }
    
    // Создаем карту пользователей для быстрого поиска
    const usersMap = new Map(users.map(user => [user.id.toString(), user]));

    // Преобразуем BigInt поля в строки для JSON сериализации
    const serializedOrders = orders.map((order: any) => {
      const serializedOrder: any = {};
      
      // Преобразуем все поля заказа
      for (const [key, value] of Object.entries(order)) {
        if (typeof value === 'bigint') {
          serializedOrder[key] = value.toString();
        } else if (key === 'order_items' && Array.isArray(value)) {
          serializedOrder[key] = value.map((item: any) => {
            const serializedItem: any = {};
            for (const [itemKey, itemValue] of Object.entries(item)) {
              if (typeof itemValue === 'bigint') {
                serializedItem[itemKey] = itemValue.toString();
              } else {
                serializedItem[itemKey] = itemValue;
              }
            }
            return serializedItem;
          });
        } else {
          serializedOrder[key] = value;
        }
      }
      
      // Добавляем данные пользователя, если найден
      if (order.user_id) {
        const user = usersMap.get(order.user_id.toString());
        if (user) {
          serializedOrder.user = {
            id: user.id.toString(),
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            username: user.username,
          };
          
          // Если customername пустое, используем данные пользователя
          if (!serializedOrder.customername && (user.first_name || user.last_name)) {
            serializedOrder.customername = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          }
          
          // Если customeremail пустое, используем email пользователя
          if (!serializedOrder.customeremail && user.email) {
            serializedOrder.customeremail = user.email;
          }
          
          // Если customerphone пустое, используем phone_number пользователя
          if (!serializedOrder.customerphone && user.phone_number) {
            serializedOrder.customerphone = user.phone_number;
          }
        }
      }
      
      return serializedOrder;
    });

    return NextResponse.json({
      orders: serializedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
      stats: {
        totalRevenue: stats._sum.total_amount ? (typeof stats._sum.total_amount === 'bigint' ? stats._sum.total_amount.toString() : stats._sum.total_amount) : 0,
        averageOrderValue: stats._avg.total_amount ? (typeof stats._avg.total_amount === 'bigint' ? stats._avg.total_amount.toString() : stats._avg.total_amount) : 0,
        totalDeliveryCost: stats._sum.deliverycost ? (typeof stats._sum.deliverycost === 'bigint' ? stats._sum.deliverycost.toString() : stats._sum.deliverycost) : 0,
        totalBonus: stats._sum.bonus ? (typeof stats._sum.bonus === 'bigint' ? stats._sum.bonus.toString() : stats._sum.bonus) : 0,
        uniqueCities: uniqueCities.length,
        ordersWithTracking,
        paidOrders,
        shippedOrders,
      },
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error message:', error.message);
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - создание нового заказа (для тестирования)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const order = await (prisma as any).orders.create({
      data: {
        externalid: body.externalid || `local-${Date.now()}`,
        customername: body.customername,
        customeremail: body.customeremail,
        customerphone: body.customerphone,
        status: body.status,
        total_amount: body.total_amount,
        currency: body.currency || 'RUB',
        orderdate: body.orderdate ? new Date(body.orderdate) : undefined,
        bankcard: body.bankcard,
        bonus: body.bonus || 0,
        customercity: body.customercity,
        deliverycost: body.deliverycost || 0,
        paid_at: body.paid_at ? new Date(body.paid_at) : null,
        shipped_at: body.shipped_at ? new Date(body.shipped_at) : null,
        customeraddress: body.customeraddress,
        order_items: body.items ? {
          create: body.items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
        } : undefined,
      },
      include: {
        order_items: true,
      },
    });

    // Преобразуем BigInt поля в строки для JSON сериализации
    const serializedOrder = {
      ...order,
      id: order.id.toString(),
      user_id: order.user_id ? order.user_id.toString() : null,
      order_items: order.order_items?.map((item: any) => ({
        ...item,
        id: item.id.toString(),
        order_id: item.order_id.toString(),
        product_id: item.product_id ? item.product_id.toString() : null,
      })) || [],
    };

    return NextResponse.json(serializedOrder);

  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error message:', error.message);
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 