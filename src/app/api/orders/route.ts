import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { OrderFilters } from '@/types/order';

// GET - получение списка заказов с фильтрацией
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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
    const sortBy = searchParams.get('sortBy') || 'orderDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Параметры даты из DateRangeContext
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Строим фильтры
    const where: any = {};

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { externalId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (customerCity) {
      where.customerCity = customerCity;
    }

    if (currency) {
      where.currency = currency;
    }

    if (isPaid === 'true') {
      where.paidAt = { not: null };
    } else if (isPaid === 'false') {
      where.paidAt = null;
    }

    if (isShipped === 'true') {
      where.shippedAt = { not: null };
    } else if (isShipped === 'false') {
      where.shippedAt = null;
    }

    if (minTotal) {
      where.total = { ...where.total, gte: parseFloat(minTotal) };
    }

    if (maxTotal) {
      where.total = { ...where.total, lte: parseFloat(maxTotal) };
    }

    // Фильтрация по дате
    if (from || to) {
      where.orderDate = {};
      
      if (from) {
        const fromDate = new Date(from);
        fromDate.setHours(0, 0, 0, 0);
        where.orderDate.gte = fromDate;
      }
      
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.orderDate.lte = toDate;
      }
    }

    // Определяем поле для сортировки
    let orderBy: any = {};
    switch (sortBy) {
      case 'customerName':
        orderBy.customerName = sortOrder;
        break;
      case 'status':
        orderBy.status = sortOrder;
        break;
      case 'total':
        orderBy.total = sortOrder;
        break;
      case 'createdAt':
        orderBy.createdAt = sortOrder;
        break;
      case 'orderDate':
        // Для сортировки по дате используем createdAt как основное поле
        // (логика отображения правильной даты будет на фронтенде)
        orderBy.createdAt = sortOrder;
        break;
      default:
        // По умолчанию сортируем по дате создания
        orderBy.createdAt = sortOrder;
    }

    // Получаем заказы
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    // Расчет статистики
    const stats = await prisma.order.aggregate({
      where,
      _sum: {
        total: true,
        deliveryCost: true,
        bonus: true,
      },
      _avg: {
        total: true,
      },
    });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
      stats: {
        totalRevenue: stats._sum.total || 0,
        averageOrderValue: stats._avg.total || 0,
        totalDeliveryCost: stats._sum.deliveryCost || 0,
        totalBonus: stats._sum.bonus || 0,
      },
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - создание нового заказа (для тестирования)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const order = await prisma.order.create({
      data: {
        externalId: body.externalId || `local-${Date.now()}`,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        status: body.status,
        total: body.total,
        currency: body.currency || 'RUB',
        orderDate: new Date(body.orderDate),
        bankCard: body.bankCard,
        bonus: body.bonus || 0,
        customerCity: body.customerCity,
        deliveryCost: body.deliveryCost || 0,
        paidAt: body.paidAt ? new Date(body.paidAt) : null,
        shippedAt: body.shippedAt ? new Date(body.shippedAt) : null,
        customerAddress: body.customerAddress,
        items: body.items ? {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        } : undefined,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order);

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 