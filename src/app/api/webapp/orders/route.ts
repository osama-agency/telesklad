import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import LoyaltyService from '@/lib/services/loyaltyService';

const prisma = new PrismaClient();

// Тот же фиксированный тестовый пользователь как в других API
const TEST_USER_ID = 9999;

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

// POST /api/webapp/orders - создание нового заказа с бонусами
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { delivery_data, cart_items, bonus = 0, total } = body;

    // Валидация данных
    if (!delivery_data || !cart_items || cart_items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Неполные данные заказа' },
        { status: 400 }
      );
    }

    // Получаем пользователя
    const user = await prisma.users.findUnique({
      where: { id: BigInt(TEST_USER_ID) },
      include: {
        account_tiers: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Валидируем использование бонусов если они указаны
    if (bonus > 0) {
      try {
        await LoyaltyService.validateBonusUsage(
          BigInt(TEST_USER_ID),
          bonus,
          total - bonus // общая сумма без учета бонусов
        );
      } catch (error: any) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    // Создаем заказ в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем данные пользователя из формы доставки
      await tx.users.update({
        where: { id: BigInt(TEST_USER_ID) },
        data: {
          first_name: delivery_data.first_name,
          last_name: delivery_data.last_name,
          middle_name: delivery_data.middle_name,
          phone_number: delivery_data.phone_number,
          address: delivery_data.address,
          street: delivery_data.street,
          home: delivery_data.home,
          apartment: delivery_data.apartment,
          build: delivery_data.build,
          postal_code: delivery_data.postal_code,
          updated_at: new Date()
        }
      });

      // Определяем доставку
      const hasDelivery = cart_items.length === 1 && cart_items[0].quantity === 1;
      
      // Создаем заказ
      const order = await tx.orders.create({
        data: {
          user_id: BigInt(TEST_USER_ID),
          total_amount: total,
          status: 0, // unpaid
          has_delivery: hasDelivery,
          bonus: bonus,
          created_at: new Date(),
          updated_at: new Date(),
          externalid: `webapp_${Date.now()}_${TEST_USER_ID}`
        }
      });

      // Создаем товары заказа
      for (const item of cart_items) {
        // Получаем актуальную цену товара
        const product = await tx.products.findUnique({
          where: { id: BigInt(item.product_id) }
        });

        if (!product) {
          throw new Error(`Товар ${item.product_id} не найден`);
        }

        // Проверяем наличие на складе
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Недостаточно товара "${product.name}" на складе`);
        }

        await tx.order_items.create({
          data: {
            order_id: order.id,
            product_id: BigInt(item.product_id),
            quantity: item.quantity,
            price: product.price,
            created_at: new Date(),
            updated_at: new Date(),
            name: product.name,
            total: Number(product.price) * item.quantity
          }
        });
      }

      // Списываем бонусы если они использованы
      if (bonus > 0) {
        await LoyaltyService.deductBonus(
          BigInt(TEST_USER_ID),
          bonus,
          'order_deduct',
          'orders',
          order.id
        );
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: Number(result.id),
        total_amount: Number(result.total_amount),
        status: 'unpaid',
        bonus_applied: bonus,
        created_at: result.created_at
      },
      message: 'Заказ успешно создан'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Ошибка создания заказа' },
      { status: 500 }
    );
  }
}

// GET /api/webapp/orders - получить историю заказов пользователя
export async function GET(request: NextRequest) {
  try {
    // Получаем заказы пользователя с товарами (как в Rails: user.orders.includes(:order_items))
    const orders = await prisma.orders.findMany({
      where: {
        user_id: TEST_USER_ID
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