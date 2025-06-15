import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Параметры даты
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const orderId = searchParams.get('orderId');

    // Строим фильтры
    const where: any = {};

    if (orderId) {
      where.id = orderId;
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

    // Получаем заказы с товарами
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
    });

    // Рассчитываем прибыль для каждого заказа
    const ordersWithProfit = await Promise.all(
      orders.map(async (order) => {
        let totalCost = 0;
        let totalRevenue = 0;
        let itemsWithProfit = [];

        for (const item of order.items) {
          // Получаем продукт для средней закупочной цены
          const product = item.productId 
            ? await prisma.product.findUnique({
                where: { id: parseInt(item.productId) },
                select: { avgPurchasePriceRub: true },
              })
            : null;

          const avgCost = product?.avgPurchasePriceRub 
            ? Number(product.avgPurchasePriceRub) 
            : 0;

          const itemCost = avgCost * item.quantity;
          const itemRevenue = Number(item.total);
          const itemProfit = itemRevenue - itemCost;

          totalCost += itemCost;
          totalRevenue += itemRevenue;

          itemsWithProfit.push({
            ...item,
            avgCost,
            totalCost: itemCost,
            profit: itemProfit,
            profitMargin: itemRevenue > 0 ? (itemProfit / itemRevenue) * 100 : 0,
          });
        }

        // Учитываем расходы на доставку
        const deliveryCost = Number(order.deliveryCost) || 0;
        totalCost += deliveryCost;

        // Учитываем бонусы (уменьшают прибыль)
        const bonus = Number(order.bonus) || 0;
        totalRevenue -= bonus;

        const orderProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (orderProfit / totalRevenue) * 100 : 0;

        return {
          ...order,
          items: itemsWithProfit,
          totalCost,
          totalRevenue,
          profit: orderProfit,
          profitMargin,
        };
      })
    );

    // Общая статистика
    const totalStats = ordersWithProfit.reduce(
      (acc, order) => ({
        totalRevenue: acc.totalRevenue + order.totalRevenue,
        totalCost: acc.totalCost + order.totalCost,
        totalProfit: acc.totalProfit + order.profit,
        orderCount: acc.orderCount + 1,
      }),
      { totalRevenue: 0, totalCost: 0, totalProfit: 0, orderCount: 0 }
    );

    const avgProfitMargin = totalStats.totalRevenue > 0 
      ? (totalStats.totalProfit / totalStats.totalRevenue) * 100 
      : 0;

    return NextResponse.json({
      orders: ordersWithProfit,
      stats: {
        ...totalStats,
        avgProfitMargin,
        avgOrderProfit: totalStats.orderCount > 0 
          ? totalStats.totalProfit / totalStats.orderCount 
          : 0,
      },
    });

  } catch (error) {
    console.error('Error calculating order profit:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 