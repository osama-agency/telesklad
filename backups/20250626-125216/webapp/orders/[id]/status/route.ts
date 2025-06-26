import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ReportService } from '@/lib/services/ReportService';
import { NotificationSchedulerService } from '@/lib/services/notification-scheduler.service';
import LoyaltyService from '@/lib/services/loyaltyService';

const prisma = new PrismaClient();

// Маппинг статусов
const STATUS_CODES = {
  'unpaid': 0,
  'paid': 1,
  'processing': 2,
  'shipped': 3,
  'delivered': 4,
  'cancelled': 5
};

const ORDER_STATUSES = {
  0: 'unpaid',
  1: 'paid', 
  2: 'processing',
  3: 'shipped',
  4: 'delivered',
  5: 'cancelled'
};

// PUT - обновление статуса заказа с уведомлениями
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status } = await request.json();
    const { id } = await params;
    const orderId = parseInt(id);

    if (!status || !STATUS_CODES.hasOwnProperty(status)) {
      return NextResponse.json({ error: 'Неверный статус' }, { status: 400 });
    }

    // Получаем заказ с данными пользователя и товарами
    const order = await prisma.orders.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        users: true,
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
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    const oldStatus = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
    const newStatusCode = STATUS_CODES[status as keyof typeof STATUS_CODES];

    // Обновляем статус заказа
    const updatedOrder = await prisma.orders.update({
      where: { id: BigInt(orderId) },
      data: { 
        status: newStatusCode,
        updated_at: new Date(),
        // Автоматические timestamp'ы
        ...(status === 'paid' && { paid_at: new Date() }),
        ...(status === 'processing' && { paid_at: new Date() }), // processing означает что оплата подтверждена
        ...(status === 'shipped' && { shipped_at: new Date() })
      }
    });

    // Получаем настройки для отправки сообщений
    const settings = await prisma.settings.findMany();
    const settingsMap = settings.reduce((acc, s) => {
      if (s.variable && s.value) {
        acc[s.variable] = s.value;
      }
      return acc;
    }, {} as Record<string, string>);

    // Подготавливаем данные для уведомлений
    const orderData = {
      id: orderId,
      total_amount: Number(order.total_amount),
      items: order.order_items.map(item => ({
        product_name: item.products.name || 'Товар',
        quantity: item.quantity,
        price: Number(item.price || 0)
      })),
      bonus: order.bonus
    };

    const userData = {
      tg_id: order.users.tg_id.toString(),
      full_name: `${order.users.first_name || ''} ${order.users.last_name || ''}`.trim() || 'Клиент',
      full_address: buildFullAddress(order.users),
      phone_number: order.users.phone_number || 'Не указан',
      postal_code: order.users.postal_code || undefined
    };

    // 🔥 ОТПРАВЛЯЕМ УВЕДОМЛЕНИЯ В ЗАВИСИМОСТИ ОТ СТАТУСА
    let notificationResult = false;

    try {
      switch (status) {
        case 'unpaid':
          // Новый заказ создан - отправляем клиенту через ReportService
          const orderForReport = {
            ...updatedOrder,
            users: order.users,
            order_items: order.order_items,
            bank_cards: null,
            msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
          };
          await ReportService.handleOrderStatusChange(orderForReport as any, oldStatus === 'unpaid' ? -1 : STATUS_CODES[oldStatus as keyof typeof STATUS_CODES]);
          notificationResult = true;
          break;

        case 'paid':
          // Клиент нажал "Я оплатил" - уведомляем админа через ReportService
          const paidOrderForReport = {
            ...updatedOrder,
            users: order.users,
            order_items: order.order_items,
            bank_cards: null,
            msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
          };
          await ReportService.handleOrderStatusChange(paidOrderForReport as any, STATUS_CODES[oldStatus as keyof typeof STATUS_CODES]);
          notificationResult = true;
          
          // 🚫 ОТМЕНЯЕМ НАПОМИНАНИЯ О НЕОПЛАЧЕННОМ ЗАКАЗЕ
          try {
            await NotificationSchedulerService.cancelPaymentReminders(orderId);
            console.log(`🚫 Payment reminders cancelled for order #${orderId}`);
          } catch (cancelError) {
            console.error('❌ Error cancelling payment reminders:', cancelError);
          }
          break;

        case 'processing':
          // Админ подтвердил оплату - уведомляем клиента и курьера через ReportService
          const processingOrderForReport = {
            ...updatedOrder,
            users: order.users,
            order_items: order.order_items,
            bank_cards: null,
            msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
          };
          await ReportService.handleOrderStatusChange(processingOrderForReport as any, STATUS_CODES[oldStatus as keyof typeof STATUS_CODES]);
          notificationResult = true;
          
          // 🎁 ОБРАБАТЫВАЕМ КЭШБЕК И УВЕДОМЛЕНИЯ О БОНУСАХ
          try {
            const userId = BigInt(order.users.id);
            const orderTotal = Number(order.total_amount);
            
            // Начисляем кэшбек за заказ
            const cashbackResult = await LoyaltyService.processOrderCashback(BigInt(orderId), userId);
            
            if (cashbackResult) {
              const bonusAmount = cashbackResult.bonusLog.bonus_amount;
              console.log(`💰 Cashback processed: ${bonusAmount} for order #${orderId}`);
              
              // Планируем уведомление о начислении бонусов
              await NotificationSchedulerService.scheduleBonusNotification(
                Number(userId), 
                Number(bonusAmount), 
                orderId
              );
            }
            
            // Проверяем повышение уровня лояльности
            const oldUserData = await prisma.users.findUnique({
              where: { id: userId },
              include: { account_tiers: true }
            });
            
            // Увеличиваем счетчик заказов и проверяем уровень
            const tierUpdateResult = await LoyaltyService.incrementOrderCount(userId, orderTotal);
            
            if (tierUpdateResult) {
              const newUserData = await prisma.users.findUnique({
                where: { id: userId },
                include: { account_tiers: true }
              });
              
              // Если уровень изменился, планируем уведомление
              if (newUserData?.account_tiers && 
                  oldUserData?.account_tier_id !== newUserData.account_tier_id) {
                
                                 await NotificationSchedulerService.scheduleAccountTierNotification(
                   Number(userId),
                   newUserData.account_tiers.title || 'Новый уровень',
                   newUserData.account_tiers.bonus_percentage || 1
                 );
                
                console.log(`🎖️ Account tier upgraded for user ${userId}`);
              }
            }
            
          } catch (loyaltyError) {
            console.error('❌ Error processing loyalty benefits:', loyaltyError);
            // Не блокируем обновление статуса из-за ошибки лояльности
          }
          break;

        case 'cancelled':
          // Заказ отменен - уведомляем клиента через ReportService
          const cancelledOrderForReport = {
            ...updatedOrder,
            users: order.users,
            order_items: order.order_items,
            bank_cards: null,
            msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
          };
          await ReportService.handleOrderStatusChange(cancelledOrderForReport as any, STATUS_CODES[oldStatus as keyof typeof STATUS_CODES]);
          notificationResult = true;
          break;

        default:
          console.log(`ℹ️ No notification configured for status: ${status}`);
          notificationResult = true; // Считаем успешным если уведомление не требуется
      }
    } catch (notificationError) {
      console.error('❌ Notification error:', notificationError);
      // Не блокируем обновление статуса из-за ошибки уведомления
    }

    console.log(`✅ Order #${orderId} status updated: ${oldStatus} → ${status}`);

    return NextResponse.json({ 
      success: true, 
      order: {
        id: orderId,
        status: status,
        updated_at: updatedOrder.updated_at
      },
      notification_sent: notificationResult
    });

  } catch (error) {
    console.error('❌ Order status update error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления статуса заказа' }, 
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