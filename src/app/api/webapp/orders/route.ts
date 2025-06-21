import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import LoyaltyService from '@/lib/services/loyaltyService';
import { S3Service } from '@/lib/services/s3';
import { WebappTelegramBotService } from '@/lib/services/webapp-telegram-bot.service';
import { NotificationSchedulerService } from '@/lib/services/notification-scheduler.service';

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

    // 🔥 ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ В TELEGRAM ЧЕРЕЗ WEBAPP БОТА
    try {
      // Получаем настройки для отправки сообщений
      const settings = await prisma.settings.findMany();
      const settingsMap = settings.reduce((acc, s) => {
        if (s.variable && s.value) {
          acc[s.variable] = s.value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Получаем обновленные данные пользователя после обновления
      const updatedUser = await prisma.users.findUnique({
        where: { id: BigInt(TEST_USER_ID) }
      });

      if (updatedUser && updatedUser.tg_id) {
        // Подготавливаем данные для уведомления
        const orderData = {
          id: Number(result.id),
          total_amount: total,
          items: cart_items.map((item: any) => {
            // Находим товар в корзине для получения актуальной информации
            const product = cart_items.find((ci: any) => ci.product_id === item.product_id);
            return {
              product_name: product?.name || item.name || 'Товар',
              quantity: item.quantity,
              price: Number(item.price || 0)
            };
          }),
          bonus: bonus
        };

        const userData = {
          tg_id: updatedUser.tg_id.toString(),
          full_name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim() || 'Клиент',
          full_address: buildFullAddress(updatedUser),
          phone_number: updatedUser.phone_number || 'Не указан',
          postal_code: updatedUser.postal_code || undefined
        };

        // Отправляем уведомление о создании заказа
        const notificationResult = await WebappTelegramBotService.sendOrderCreated(
          orderData, 
          userData, 
          settingsMap
        );

        // Сохраняем message_id если уведомление отправлено успешно
        if (notificationResult.success && notificationResult.messageId) {
          await prisma.orders.update({
            where: { id: result.id },
            data: { msg_id: notificationResult.messageId }
          });
        }

        console.log(`✅ Order #${Number(result.id)} notification sent:`, notificationResult.success);
      } else {
        console.log(`ℹ️ Order #${Number(result.id)} - user has no Telegram ID, skipping notification`);
      }
    } catch (notificationError) {
      console.error('❌ Order notification error:', notificationError);
      // Не блокируем создание заказа из-за ошибки уведомления
    }

    // 🔔 ПЛАНИРУЕМ НАПОМИНАНИЯ О НЕОПЛАЧЕННОМ ЗАКАЗЕ
    try {
      await NotificationSchedulerService.schedulePaymentReminder(
        Number(result.id), 
        TEST_USER_ID
      );
      console.log(`📅 Payment reminders scheduled for order #${Number(result.id)}`);
    } catch (reminderError) {
      console.error('❌ Error scheduling payment reminders:', reminderError);
      // Не блокируем создание заказа из-за ошибки планирования
    }

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

    // Получаем все уникальные product_id из всех заказов
    const allProductIds = new Set<number>();
    orders.forEach(order => {
      order.order_items.forEach(item => {
        allProductIds.add(Number(item.products.id));
      });
    });

    // Получаем изображения для всех товаров
    const attachments = await prisma.active_storage_attachments.findMany({
      where: {
        record_type: 'Product',
        record_id: { in: Array.from(allProductIds) },
        name: 'image'
      },
      include: {
        active_storage_blobs: true
      }
    });

    // Создаём карту product_id -> blob_key
    const imageMap = new Map<number, string>();
    attachments.forEach(attachment => {
      imageMap.set(Number(attachment.record_id), attachment.active_storage_blobs.key);
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
        items: order.order_items.map(item => {
          const productId = Number(item.products.id);
          const blobKey = imageMap.get(productId);
          
          return {
            id: Number(item.id),
            product_id: productId,
            product_name: item.products.name,
            quantity: item.quantity,
            price: Number(item.price),
            total: Number(item.price) * item.quantity,
            image_url: blobKey ? S3Service.getImageUrl(blobKey) : undefined
          };
        }),
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

// Вспомогательная функция для построения полного адреса
function buildFullAddress(user: any): string {
  const parts = [];
  
  if (user.address) parts.push(user.address);
  if (user.street) parts.push(user.street);
  if (user.home) parts.push(`дом ${user.home}`);
  if (user.apartment) parts.push(`кв. ${user.apartment}`);
  if (user.build) parts.push(`корп. ${user.build}`);
  
  return parts.join(', ') || 'Адрес не указан';
} 