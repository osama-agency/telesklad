import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const productId = searchParams.get('product_id');
    const operation = searchParams.get('operation'); // 'purchase', 'sale', 'all'
    
    const skip = (page - 1) * limit;

    // Получаем данные о покупках (пополнение остатков)
    const purchaseItems = await prisma.purchase_items.findMany({
      where: productId ? { productid: BigInt(productId) } : {},
      include: {
        products: {
          select: {
            id: true,
            name: true
          }
        },
        purchases: {
          select: {
            id: true,
            createdat: true,
            status: true,
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                tg_id: true
              }
            }
          }
        }
      },
      orderBy: {
        createdat: 'desc'
      },
      skip: operation === 'sale' ? undefined : skip,
      take: operation === 'sale' ? undefined : limit
    });

    // Получаем данные о заказах (списание остатков)
    const orderItems = await prisma.order_items.findMany({
      where: productId ? { product_id: BigInt(productId) } : {},
      include: {
        products: {
          select: {
            id: true,
            name: true
          }
        },
        orders: {
          select: {
            id: true,
            created_at: true,
            status: true,
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                tg_id: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: operation === 'purchase' ? undefined : skip,
      take: operation === 'purchase' ? undefined : limit
    });

    // Объединяем и трансформируем данные
    let logs: any[] = [];

    if (operation !== 'sale') {
      // Добавляем покупки (пополнение)
      const purchaseLogs = purchaseItems.map(item => ({
        id: `purchase_${item.id}`,
        product_id: item.productid.toString(),
        product: {
          id: item.products.id.toString(),
          name: item.products.name
        },
        quantity_change: item.quantity,
        operation_type: 'purchase',
        source_type: 'Purchase',
        source_id: item.purchaseid.toString(),
        user: {
          id: item.purchases.users.id.toString(),
          first_name: item.purchases.users.first_name,
          last_name: item.purchases.users.last_name,
          username: item.purchases.users.username,
          tg_id: item.purchases.users.tg_id.toString(),
          display_name: item.purchases.users.first_name || item.purchases.users.username || `User ${item.purchases.users.tg_id}`
        },
        created_at: item.createdat,
        notes: `Закупка #${item.purchaseid}, статус: ${item.purchases.status}`,
        cost_per_unit: item.unitcostrub || 0,
        total_cost: item.totalcostrub || 0
      }));
      logs.push(...purchaseLogs);
    }

    if (operation !== 'purchase') {
      // Добавляем заказы (списание)
      const orderLogs = orderItems.map(item => ({
        id: `order_${item.id}`,
        product_id: item.product_id.toString(),
        product: {
          id: item.products.id.toString(),
          name: item.products.name
        },
        quantity_change: -item.quantity, // Отрицательное значение для списания
        operation_type: 'sale',
        source_type: 'Order',
        source_id: item.order_id.toString(),
        user: {
          id: item.orders.users.id.toString(),
          first_name: item.orders.users.first_name,
          last_name: item.orders.users.last_name,
          username: item.orders.users.username,
          tg_id: item.orders.users.tg_id.toString(),
          display_name: item.orders.users.first_name || item.orders.users.username || `User ${item.orders.users.tg_id}`
        },
        created_at: item.created_at,
        notes: `Заказ #${item.order_id}, статус: ${item.orders.status}`,
        cost_per_unit: item.price || 0,
                 total_cost: Number(item.price || 0) * item.quantity
      }));
      logs.push(...orderLogs);
    }

    // Сортируем по дате
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Применяем пагинацию если нужно
    const total = logs.length;
    if (operation === 'all') {
      logs = logs.slice(skip, skip + limit);
    }

    // Статистика
    const totalPurchases = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalSales = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const stats = {
      total_operations: purchaseItems.length + orderItems.length,
      purchases: {
        operations: purchaseItems.length,
        quantity: totalPurchases
      },
      sales: {
        operations: orderItems.length,
        quantity: totalSales
      },
      net_change: totalPurchases - totalSales
    };

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Ошибка получения логов остатков:', error);
    return NextResponse.json(
      { error: 'Ошибка получения логов остатков' },
      { status: 500 }
    );
  }
} 