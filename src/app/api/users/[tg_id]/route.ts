import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - получить информацию о пользователе по tg_id
export async function GET(request: NextRequest, context: { params: Promise<{ tg_id: string }> }) {
  try {
    const params = await context.params;
    const tgId = params.tg_id;

    // Получаем пользователя
    const user = await prisma.users.findUnique({
      where: {
        tg_id: BigInt(tgId)
      },
      include: {
        orders: {
          include: {
            order_items: {
              include: {
                products: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 10 // Последние 10 заказов
        },
        purchases: {
          orderBy: {
            createdat: 'desc'
          },
          take: 5 // Последние 5 закупок
        },
        reviews: {
          include: {
            products: true
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 5 // Последние 5 отзывов
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Статистика пользователя
    const stats = await prisma.orders.aggregate({
      where: {
        user_id: user.id
      },
      _sum: {
        total_amount: true
      },
      _count: {
        id: true
      }
    });

    // Статистика по статусам заказов
    const orderStatuses = await prisma.orders.groupBy({
      by: ['status'],
      where: {
        user_id: user.id
      },
      _count: {
        id: true
      }
    });

    // Преобразуем BigInt в строки для JSON сериализации
    const serializedUser = {
      ...user,
      id: user.id.toString(),
      tg_id: user.tg_id.toString(),
      account_tier_id: user.account_tier_id?.toString() || null,
      orders: user.orders.map(order => ({
        ...order,
        id: order.id.toString(),
        user_id: order.user_id.toString(),
        bank_card_id: order.bank_card_id?.toString() || null,
        total_amount: order.total_amount.toString(),
        total: order.total?.toString() || null,
        deliverycost: order.deliverycost?.toString() || null,
        order_items: order.order_items.map(item => ({
          ...item,
          id: item.id.toString(),
          order_id: item.order_id.toString(),
          product_id: item.product_id.toString(),
          orderid: item.orderid?.toString() || null,
          price: item.price?.toString() || null,
          total: item.total?.toString() || null,
          products: {
            ...item.products,
            id: item.products.id.toString(),
            price: item.products.price?.toString() || null,
            old_price: item.products.old_price?.toString() || null,
            prime_cost: item.products.prime_cost?.toString() || null,
            avgpurchasepricerub: item.products.avgpurchasepricerub?.toString() || null,
            avgpurchasepricetry: item.products.avgpurchasepricetry?.toString() || null,
          }
        }))
      })),
      purchases: user.purchases.map(purchase => ({
        ...purchase,
        userid: purchase.userid.toString(),
      })),
      reviews: user.reviews.map(review => ({
        ...review,
        id: review.id.toString(),
        user_id: review.user_id.toString(),
        product_id: review.product_id.toString(),
        products: {
          ...review.products,
          id: review.products.id.toString(),
          price: review.products.price?.toString() || null,
          old_price: review.products.old_price?.toString() || null,
          prime_cost: review.products.prime_cost?.toString() || null,
          avgpurchasepricerub: review.products.avgpurchasepricerub?.toString() || null,
          avgpurchasepricetry: review.products.avgpurchasepricetry?.toString() || null,
        }
      }))
    };

    const userStats = {
      totalOrders: stats._count.id || 0,
      totalSpent: stats._sum.total_amount?.toString() || '0',
      orderStatuses: orderStatuses.map(status => ({
        status: status.status,
        count: status._count.id
      })),
      avgOrderValue: stats._count.id > 0 
        ? (Number(stats._sum.total_amount || 0) / stats._count.id).toFixed(2)
        : '0'
    };

    return NextResponse.json({
      user: serializedUser,
      stats: userStats
    });

  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении пользователя' },
      { status: 500 }
    );
  }
} 