import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Временный пользователь для демонстрации
// В реальном проекте ID будет из сессии/токена
const DEMO_USER_ID = 1;

// Статусы заказов как в Rails проекте
const ORDER_STATUSES = {
  0: 'unpaid',     // не оплачен
  1: 'paid',       // оплачен
  2: 'shipped',    // отправлен
  3: 'delivered',  // доставлен
  4: 'cancelled'   // отменен
};

const STATUS_LABELS = {
  'unpaid': 'Не оплачен',
  'paid': 'Оплачен',
  'shipped': 'Отправлен', 
  'delivered': 'Доставлен',
  'cancelled': 'Отменен'
};

// GET /api/webapp/orders - получить историю заказов пользователя
export async function GET(request: NextRequest) {
  try {
    // Получаем заказы пользователя с товарами (как в Rails: user.orders.includes(:order_items))
    const orders = await prisma.orders.findMany({
      where: {
        user_id: DEMO_USER_ID
      },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        bank_cards: {
          select: {
            id: true,
            name: true,
            number: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Преобразуем заказы в нужный формат
    const transformedOrders = orders.map(order => {
      const statusKey = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || 'unpaid';
      
      return {
        id: Number(order.id),
        total_amount: Number(order.total_amount),
        status: statusKey,
        status_label: STATUS_LABELS[statusKey as keyof typeof STATUS_LABELS],
        created_at: order.created_at,
        paid_at: order.paid_at,
        shipped_at: order.shipped_at,
        tracking_number: order.tracking_number,
        has_delivery: order.has_delivery,
        bonus: order.bonus,
        msg_id: order.msg_id,
        bank_card: order.bank_cards ? {
          id: Number(order.bank_cards.id),
          name: order.bank_cards.name,
          number: order.bank_cards.number
        } : null,
        items: order.order_items.map(item => ({
          id: Number(item.id),
          product_id: Number(item.products.id),
          product_name: item.products.name,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.price) * item.quantity
        })),
        items_count: order.order_items.length,
        total_items: order.order_items.reduce((sum, item) => sum + item.quantity, 0)
      };
    });

    // Статистика заказов
    const stats = {
      total_orders: orders.length,
      unpaid_orders: orders.filter(o => o.status === 0).length,
      paid_orders: orders.filter(o => o.status === 1).length,
      shipped_orders: orders.filter(o => o.status === 2).length,
      delivered_orders: orders.filter(o => o.status === 3).length,
      cancelled_orders: orders.filter(o => o.status === 4).length,
      total_amount: orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
      total_bonus_earned: orders.reduce((sum, order) => sum + order.bonus, 0)
    };

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      stats: stats,
      count: transformedOrders.length
    });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки истории заказов' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 