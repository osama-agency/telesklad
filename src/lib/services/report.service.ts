import { TelegramService } from './TelegramService';
import { TelegramMessageTemplatesService } from './telegram-message-templates.service';
import { prisma } from '@/libs/prismaDb';

interface Order {
  id: bigint;
  user_id: bigint;
  status: number;
  total_amount: any;
  tracking_number?: string | null;
  msg_id?: bigint | null;
  order_items?: any[];
}

interface User {
  id: bigint;
  tg_id: bigint;
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  phone_number?: string | null;
  postal_code?: number | null;
  address?: string | null;
  street?: string | null;
  home?: string | null;
  apartment?: string | null;
  build?: string | null;
}

export class ReportService {
  // Ожидание перед запросом отзыва (10 дней)
  private static readonly REVIEW_WAIT = 10 * 24 * 60 * 60 * 1000; // 10 дней в миллисекундах

  /**
   * Обработка изменения статуса заказа (аналог Rails order.rb after_update)
   */
  static async handleOrderStatusChange(order: Order, previousStatus: number): Promise<void> {
    if (order.status === previousStatus) return;

    console.log(`📋 Order ${order.id} status changed from ${previousStatus} to ${order.status}`);

    switch (order.status) {
      case 0: // unpaid
        await this.onUnpaid(order);
        break;
      case 1: // paid
        await this.onPaid(order);
        break;
      case 2: // processing/shipped
        if (previousStatus === 1) {
          await this.onProcessing(order);
        } else if (order.tracking_number) {
          await this.onShipped(order);
        }
        break;
      case 3: // delivered
        await this.onDelivered(order);
        break;
      case 4: // cancelled
        await this.onCancelled(order);
        break;
      case 5: // refunded
        await this.onRefunded(order);
        break;
      case 6: // overdue
        await this.onOverdue(order);
        break;
    }
  }

  /**
   * UNPAID - Новый заказ создан
   */
  private static async onUnpaid(order: Order): Promise<void> {
    console.log(`💰 Order ${order.id} created (unpaid)`);

    const user = await this.getOrderUser(order);
    if (!user) return;

    const settings = await this.getSettings();
    const orderItems = await this.getOrderItems(order);

    // Формируем сообщение для клиента
    const msgHeader = await TelegramMessageTemplatesService.getMessage('unpaid_msg', { 
      order: order.id.toString() 
    });
    
    const itemsStr = orderItems.map(item => 
      `• ${item.name || item.products?.name} — ${item.quantity}шт. — ${item.price}₽`
    ).join('\n');

    const msgBody = await TelegramMessageTemplatesService.getMessage('unpaid_main', {
      items: itemsStr,
      fio: this.getUserFullName(user),
      address: this.getUserFullAddress(user),
      postal_code: user.postal_code || 'Не указан',
      phone: user.phone_number || 'Не указан',
      price: order.total_amount,
      card: settings.bank_card_details || 'Карта не настроена'
    });

    const fullMessage = `${msgHeader}\n\n${msgBody}`;

    // Отправляем сообщение клиенту
    await this.sendReport(order, {
      user_msg: fullMessage,
      user_tg_id: user.tg_id.toString(),
      user_markup: 'i_paid'
    });
  }

  /**
   * PAID - Клиент оплатил заказ
   */
  private static async onPaid(order: Order): Promise<void> {
    console.log(`✅ Order ${order.id} marked as paid`);

    const user = await this.getOrderUser(order);
    if (!user) return;

    const settings = await this.getSettings();
    const orderItems = await this.getOrderItems(order);

    // Сообщение клиенту
    const clientMsg = await TelegramMessageTemplatesService.getMessage('paid_client');

    // Сообщение администратору
    const itemsStr = orderItems.map(item => 
      `• ${item.name || item.products?.name} — ${item.quantity}шт. — ${item.price}₽`
    ).join('\n');

    const adminMsg = await TelegramMessageTemplatesService.getMessage('paid_admin', {
      order: order.id.toString(),
      price: order.total_amount,
      card: settings.bank_card_details || 'Не настроена',
      items: itemsStr,
      address: this.getUserFullAddress(user),
      fio: this.getUserFullName(user),
      phone: user.phone_number || 'Не указан'
    });

    // Отправляем оба сообщения
    await this.sendReport(order, {
      admin_msg: adminMsg,
      admin_markup: 'approve_payment',
      user_msg: clientMsg,
      user_tg_id: user.tg_id.toString()
    });
  }

  /**
   * PROCESSING - Оплата подтверждена, заказ в обработке
   */
  private static async onProcessing(order: Order): Promise<void> {
    console.log(`🔄 Order ${order.id} is being processed. Payment confirmed.`);

    const user = await this.getOrderUser(order);
    if (!user) return;

    const orderItems = await this.getOrderItems(order);
    const itemsStr = orderItems.map(item => 
      `• ${item.name || item.products?.name} — ${item.quantity}шт.`
    ).join('\n');

    // Сообщение курьеру
    const courierMsg = await TelegramMessageTemplatesService.getMessage('on_processing_courier', {
      order: order.id.toString(),
      postal_code: user.postal_code || 'Не указан',
      items: itemsStr,
      address: this.getUserFullAddress(user),
      fio: this.getUserFullName(user),
      phone: user.phone_number || 'Не указан'
    });

    // Сообщение клиенту
    const clientMsg = await TelegramMessageTemplatesService.getMessage('on_processing_client', {
      order: order.id.toString()
    });

    await this.sendReport(order, {
      admin_msg: courierMsg,
      admin_tg_id: 'courier',
      admin_markup: 'submit_tracking',
      user_msg: clientMsg,
      user_tg_id: user.tg_id.toString(),
      user_markup: 'new_order'
    });
  }

  /**
   * SHIPPED - Заказ отправлен
   */
  private static async onShipped(order: Order): Promise<void> {
    console.log(`📦 Order ${order.id} has been shipped`);

    const user = await this.getOrderUser(order);
    if (!user) return;

    const orderItems = await this.getOrderItems(order);
    const itemsStr = orderItems.map(item => 
      `• ${item.name || item.products?.name} — ${item.quantity}шт. — ${item.price}₽`
    ).join('\n');

    // Сообщение клиенту с трек-номером
    const clientMsg = await TelegramMessageTemplatesService.getMessage('on_shipped_courier', {
      order: order.id.toString(),
      price: order.total_amount,
      items: itemsStr,
      address: this.getUserFullAddress(user),
      fio: this.getUserFullName(user),
      phone: user.phone_number || 'Не указан',
      track: order.tracking_number || 'Не указан'
    });

    // Подтверждение курьеру
    const courierMsg = await TelegramMessageTemplatesService.getMessage('track_num_save', {
      order: order.id.toString(),
      fio: this.getUserFullName(user),
      num: order.tracking_number || 'Не указан'
    });

    await this.sendReport(order, {
      admin_msg: courierMsg,
      admin_tg_id: 'courier',
      user_msg: clientMsg,
      user_tg_id: user.tg_id.toString(),
      user_markup: 'new_order'
    });

    // Планируем запросы на отзывы
    await this.scheduleReviewRequests(order, user);
  }

  /**
   * CANCELLED - Заказ отменен
   */
  private static async onCancelled(order: Order): Promise<void> {
    console.log(`❌ Order ${order.id} has been cancelled`);

    const user = await this.getOrderUser(order);
    if (!user) return;

    const adminMsg = `❌ Заказ №${order.id} был отменен!`;
    const userMsg = await TelegramMessageTemplatesService.getMessage('cancel', {
      order: order.id.toString()
    });

    await this.sendReport(order, {
      admin_msg: adminMsg,
      user_msg: userMsg,
      user_tg_id: user.tg_id.toString(),
      user_markup: 'new_order'
    });
  }

  /**
   * DELIVERED - Заказ доставлен
   */
  private static async onDelivered(order: Order): Promise<void> {
    console.log(`✅ Order ${order.id} has been delivered`);
    // Можно добавить уведомления о доставке
  }

  /**
   * REFUNDED - Возврат средств
   */
  private static async onRefunded(order: Order): Promise<void> {
    const msg = `💸 Order №${order.id} has been refunded`;
    console.log(msg);
    await TelegramService.call(msg);
  }

  /**
   * OVERDUE - Просрочен платеж
   */
  private static async onOverdue(order: Order): Promise<void> {
    console.log(`⏰ Order ${order.id} payment is overdue`);

    const user = await this.getOrderUser(order);
    if (!user) return;

    const userMsg = await TelegramMessageTemplatesService.getMessage('unpaid_reminder_overdue', {
      order: order.id.toString()
    });

    await this.sendReport(order, {
      user_msg: userMsg,
      user_tg_id: user.tg_id.toString(),
      user_markup: 'new_order'
    });
  }

  /**
   * Планирование запросов на отзывы
   */
  private static async scheduleReviewRequests(order: Order, user: User): Promise<void> {
    const orderItems = await this.getOrderItemsWithProducts(order);

    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const product = item.products;
      
      if (!product) continue;

      // Проверяем, не оставлял ли пользователь уже отзыв на этот товар
      const existingReview = await prisma.reviews.findFirst({
        where: {
          user_id: user.id,
          product_id: product.id
        }
      });

      if (!existingReview) {
        const delay = this.REVIEW_WAIT + (i * 60 * 60 * 1000); // +1 час для каждого следующего товара
        
        // В продакшене здесь должна быть очередь задач
        setTimeout(async () => {
          await this.sendReviewRequest(product.id, user.id, order.id);
        }, delay);
      }
    }
  }

  /**
   * Отправка запроса на отзыв
   */
  private static async sendReviewRequest(productId: bigint, userId: bigint, orderId: bigint): Promise<void> {
    // Эта функция будет вызываться из очереди задач
    console.log(`📝 Sending review request for product ${productId} to user ${userId}`);
    
    // TODO: Implement review request logic
  }

  /**
   * Основной метод отправки отчетов
   */
  private static async sendReport(order: Order, params: {
    admin_msg?: string;
    admin_tg_id?: string | number;
    admin_markup?: string;
    user_msg?: string;
    user_tg_id?: string | number;
    user_markup?: string;
  }): Promise<void> {
    // Отправляем сообщение администратору
    if (params.admin_msg) {
      await TelegramService.call(
        params.admin_msg, 
        params.admin_tg_id || null,
        { markup: params.admin_markup }
      );
    }

    // Удаляем старое сообщение пользователя если есть
    if (order.msg_id && params.user_tg_id) {
      try {
        // В продакшене здесь должен быть вызов TelegramMsgDelService
        console.log(`Would delete message ${order.msg_id} from chat ${params.user_tg_id}`);
      } catch (error) {
        console.error('Failed to delete old message:', error);
      }
    }

    // Отправляем новое сообщение пользователю
    if (params.user_msg && params.user_tg_id) {
      const msgId = await TelegramService.call(
        params.user_msg,
        params.user_tg_id,
        { markup: params.user_markup }
      );

      // Сохраняем ID сообщения если отправка успешна
      if (typeof msgId === 'number') {
        await prisma.orders.update({
          where: { id: order.id },
          data: { msg_id: BigInt(msgId) }
        });
      } else {
        // Обрабатываем ошибку отправки
        await this.notifyAdmin(msgId, order.id);
      }
    }
  }

  /**
   * Уведомление админа об ошибке отправки
   */
  private static async notifyAdmin(error: Error, orderId: bigint): Promise<void> {
    const msg = `Клиенту не пришло бизнес сообщение по заказу ${orderId} по причине`;
    
    if (error.message.includes('chat not found')) {
      const settings = await this.getSettings();
      await TelegramService.call(
        `${msg} не нажатия на старт!`,
        settings.test_id || settings.admin_ids
      );
    } else if (error.message.includes('bot was blocked')) {
      const settings = await this.getSettings();
      await TelegramService.call(
        `${msg} добавления им бота в бан!`,
        settings.test_id || settings.admin_ids
      );
    } else {
      // В продакшене отправляем email об ошибке
      console.error(`${msg} ${error.message}`, error);
    }
  }

  /**
   * Вспомогательные методы
   */
  private static async getOrderUser(order: Order): Promise<User | null> {
    return prisma.users.findUnique({
      where: { id: order.user_id }
    });
  }

  private static async getOrderItems(order: Order): Promise<any[]> {
    return prisma.order_items.findMany({
      where: { order_id: order.id },
      include: { products: true }
    });
  }

  private static async getOrderItemsWithProducts(order: Order): Promise<any[]> {
    return prisma.order_items.findMany({
      where: { order_id: order.id },
      include: { products: true }
    });
  }

  private static getUserFullName(user: User): string {
    const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
    return parts.join(' ') || 'Не указано';
  }

  private static getUserFullAddress(user: User): string {
    const parts = [
      user.postal_code,
      user.address,
      user.street,
      user.home && `д. ${user.home}`,
      user.build && `корп. ${user.build}`,
      user.apartment && `кв. ${user.apartment}`
    ].filter(Boolean);
    
    return parts.join(', ') || 'Не указан';
  }

  private static async getSettings(): Promise<any> {
    const settings = await prisma.settings.findMany();
    return settings.reduce((acc, setting) => {
      if (setting.variable && setting.value) {
        acc[setting.variable] = setting.value;
      }
      return acc;
    }, {} as any);
  }
} 