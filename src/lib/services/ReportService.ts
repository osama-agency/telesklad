import { TelegramService } from './TelegramService';
import { AdminTelegramService } from './AdminTelegramService';
import { prisma } from '@/libs/prismaDb';

interface OrderForReport {
  id: bigint;
  status: number;
  total_amount: number;
  deliverycost?: number | null;
  tracking_number?: string | null;
  msg_id?: bigint | null;
  shipped_at?: Date | null;
  paid_at?: Date | null;
  created_at: Date;
  customeraddress?: string | null;
  users: {
    id: bigint;
    tg_id: bigint;
    first_name?: string | null;
    last_name?: string | null;
    middle_name?: string | null;
    first_name_raw?: string | null;
    last_name_raw?: string | null;
    postal_code?: string | null;
    address?: string | null;
    street?: string | null;
    home?: string | null;
    apartment?: string | null;
    build?: string | null;
    phone_number?: string | null;
  };
  order_items: Array<{
    quantity: number;
    price: number;
    products: {
      name: string;
      price: number;
    };
  }>;
  bank_cards?: {
    id?: bigint;
    name?: string;
    fio?: string;
    number?: string;
  } | null;
}

export class ReportService {
  private static readonly ONE_WAIT = 3 * 60 * 60 * 1000; // 3 часа в миллисекундах
  private static readonly REVIEW_WAIT = 10 * 24 * 60 * 60 * 1000; // 10 дней

  /**
   * Обработка изменения статуса заказа
   */
  static async handleOrderStatusChange(order: OrderForReport, previousStatus: number): Promise<void> {
    console.log(`📊 Order ${order.id} status changed: ${previousStatus} -> ${order.status}`);

         switch (order.status) {
       case 0: // unpaid
         await this.onUnpaid(order);
         break;
       case 1: // paid
         await this.onPaid(order);
         break;
       case 2: // processing  
         await this.onProcessing(order);
         break;
       case 3: // shipped
         await this.onShipped(order);
         break;
       case 4: // cancelled
         await this.onCancelled(order);
         break;
       case 5: // refunded
         await this.onRefunded(order);
         break;
     }
  }

  /**
   * Заказ не оплачен - отправляем клиенту реквизиты и кнопку "Я оплатил"
   */
  private static async onUnpaid(order: OrderForReport): Promise<void> {
    console.log(`Order ${order.id} is now unpaid`);

    const user = order.users;
    const orderItemsStr = this.formatOrderItems(order.order_items);
    const bankDetails = order.bank_cards 
      ? `${order.bank_cards.name}\n${order.bank_cards.fio}\n\`${order.bank_cards.number}\``
      : 'Карта не настроена';
    const fullAddress = this.buildFullAddress(order);

    // Формируем состав заказа с доставкой как в рабочем боте
    let orderComposition = orderItemsStr;
    const deliveryCost = order.deliverycost || 0;
    if (deliveryCost > 0) {
      orderComposition += `\n• Доставка — услуга — ${deliveryCost}₽`;
    }
    
    // Общая сумма к оплате = товары + доставка
    const totalToPay = Number(order.total_amount) + Number(deliveryCost);

    // Точно копируем формат рабочего бота
    const msg = `🎉 Ваш заказ №${order.id} принят.\n\n` +
      `📌 Проверьте заказ перед оплатой:\n\n` +
      `Состав заказа:\n${orderComposition}\n\n` +
      `Данные для доставки:\n👤 ${this.getFullName(user)}\n\n` +
      `🏠 ${fullAddress}\n\n` +
      `📞 ${user.phone_number || 'Не указан'}\n\n` +
      `Сумма к оплате: ${totalToPay}₽\n\n` +
      `✅ Дальнейшие действия:\n` +
      `1. Сделайте перевод:\n` +
      `ВНИМАНИЕ, ОПЛАЧИВАЙТЕ ИМЕННО НА\n${bankDetails}.\n\n` +
      `2. Нажмите кнопку «Я оплатил», чтобы мы проверили поступление и отправили ваш заказ.\n\n` +
      `❗️ Если заметили ошибку — нажмите «Изменить заказ».`;

    await this.sendReport(order, {
      userMsg: msg,
      userTgId: user.tg_id.toString(),
      userMarkup: 'i_paid'
    });

    // Планируем напоминание через 3 часа (в реальном проекте нужно использовать очереди)
    // setTimeout(() => {
    //   this.scheduleAbandonedOrderReminder(order.id);
    // }, this.ONE_WAIT);
  }

  /**
   * Заказ оплачен - уведомляем админа и клиента
   */
  private static async onPaid(order: OrderForReport): Promise<void> {
    console.log(`Order ${order.id} is now paid`);

    const user = order.users;
    const orderItemsStr = this.formatOrderItems(order.order_items);
    const bankDetails = order.bank_cards 
      ? `${order.bank_cards.name} — ${order.bank_cards.fio} — ${order.bank_cards.number}`
      : 'Карта не настроена';
    const fullAddress = this.buildFullAddress(order);

    // Формируем состав заказа с доставкой для админа
    let orderComposition = orderItemsStr;
    const deliveryCost = order.deliverycost || 0;
    if (deliveryCost > 0) {
      orderComposition += `,\n• Доставка — услуга — ${deliveryCost}₽`;
    }

    // Сообщение админу как в старом проекте  
    const totalToPay = Number(order.total_amount) + Number(deliveryCost);
    const adminMsg = `Надо проверить оплату по заказу №${order.id}\n\n` +
      `Итого отправил клиент: ${totalToPay}₽\n\n` +
      `Банк: ${bankDetails}\n\n` +
      `📄 Состав заказа:\n${orderComposition}\n\n` +
      `📍 Адрес:\n${fullAddress}\n\n` +
      `👤 ФИО:\n${this.getFullName(user)}\n\n` +
      `📱 Телефон:\n${user.phone_number || 'Не указан'}`;

    // Сообщение клиенту как в старом проекте
    const userMsg = `⏳ Идет проверка вашего перевода в нашей системе.\n\n` +
      `Пожалуйста, ожидайте - как только мы подтвердим оплату, вы получите уведомление здесь.\n\n` +
      `Примерное время ожидания: от 5 до 30 минут.`;

    await this.sendReport(order, {
      adminMsg: adminMsg,
      adminTgId: '125861752', // ID админа Эльдара
      adminMarkup: 'approve_payment',
      userMsg: userMsg,
      userTgId: user.tg_id.toString()
    });
  }

  /**
   * Заказ обрабатывается - уведомляем клиента и курьера
   */
  private static async onProcessing(order: OrderForReport): Promise<void> {
    console.log(`Order ${order.id} is being processed. Payment confirmed.`);

    const user = order.users;
    const orderItemsStr = this.formatOrderItems(order.order_items, true);
    const fullAddress = this.buildFullAddress(order);

    // Сообщение курьеру как в старом проекте
    const courierMsg = `👀 Нужно отправить заказ №${order.id}\n\n` +
      `📄 Состав заказа:\n${orderItemsStr}\n\n` +
      `📍 Адрес:\n\`${fullAddress}\`\n\n` +
      `📍 Индекс: \`${user.postal_code || 'Не указан'}\`\n\n` +
      `👤 ФИО:\n\`${this.getFullName(user)}\`\n\n` +
      `📱 Телефон:\n\`${user.phone_number || 'Не указан'}\`\n\n` +
      `🌟━━━━━━━━━━━━🌟`;

    // Сообщение клиенту как в старом проекте
    const userMsg = `❤️ Благодарим вас за покупку!\n\n` +
      `🚚 Заказ №${order.id} находится у курьера и готовится к отправке.\n\n` +
      `Как только посылка будет отправлена, мы незамедлительно вышлем вам трек-номер для отслеживания.\n\n` +
      `Процесс отправки занимает от 5 до 48 часов.\n\n` +
      `Будем признательны за ваше терпение!`;

    await this.sendReport(order, {
      adminMsg: courierMsg,
      adminTgId: 'courier',
      adminMarkup: 'submit_tracking',
      userMsg: userMsg,
      userTgId: user.tg_id.toString(),
      userMarkup: 'new_order'
    });
  }

  /**
   * Заказ отправлен - уведомляем клиента с трек-номером
   */
  private static async onShipped(order: OrderForReport): Promise<void> {
    console.log(`Order ${order.id} has been shipped`);

    const user = order.users;
    const orderItemsStr = this.formatOrderItems(order.order_items);
    const fullAddress = this.buildFullAddress(order);

    // Сообщение клиенту как в старом проекте
    const clientMsg = `✅ Заказ №${order.id}\n\n` +
      `📦 Посылка отправлена!\n\n` +
      `Ваш трек-номер: ${order.tracking_number || 'Не указан'}\n\n` +
      `📄 Состав заказа:\n${orderItemsStr}\n\n` +
      `📍 Адрес:\n${fullAddress}\n\n` +
      `👤 ФИО:\n${this.getFullName(user)}\n\n` +
      `📱 Телефон:\n${user.phone_number || 'Не указан'}`;

    // Сообщение курьеру как в старом проекте
    const courierMsg = `✅ Готово! Трек-номер отправлен клиенту.\n\n` +
      `Трек-номер: ${order.tracking_number || 'Не указан'}\n\n` +
      `Заказ №${order.id}\n\n` +
      `Клиент: ${this.getFullName(user)}`;

    await this.sendReport(order, {
      adminMsg: courierMsg,
      adminTgId: 'courier',
      userMsg: clientMsg,
      userTgId: user.tg_id.toString(),
      userMarkup: 'new_order'
    });

    // Планируем запросы отзывов (в реальном проекте нужно использовать очереди)
    // this.scheduleReviewRequests(order, user);
  }

  /**
   * Заказ отменен
   */
  private static async onCancelled(order: OrderForReport): Promise<void> {
    console.log(`Order ${order.id} has been cancelled`);

    const adminMsg = `❌ Заказ №${order.id} был отменен!`;
    
    // Сообщение клиенту как в старом проекте
    const userMsg = `❌ Ваш заказ №${order.id} отменён.\n\n` +
      `Если вы хотите оформить новый заказ, повторите покупку через каталог.`;

    await this.sendReport(order, {
      adminMsg: adminMsg,
      userMsg: userMsg,
      userTgId: order.users.tg_id.toString(),
      userMarkup: 'new_order'
    });
  }

  /**
   * Заказ возвращен
   */
  private static async onRefunded(order: OrderForReport): Promise<void> {
    const msg = `💸 Order №${order.id} has been refunded`;
    console.log(msg);
    await TelegramService.call(msg);
  }

  /**
   * Отправка уведомлений
   */
  private static async sendReport(order: OrderForReport, options: {
    adminMsg?: string;
    adminTgId?: string;
    adminMarkup?: string;
    userMsg?: string;
    userTgId?: string;
    userMarkup?: string;
  }): Promise<void> {
    try {
      // Отправляем сообщение админу/курьеру
      if (options.adminMsg) {
        // Если это сообщение админу (ID 125861752), используем основной бот
        if (options.adminTgId === '125861752') {
          await AdminTelegramService.sendToAdmin(
            options.adminMsg,
            { markup: options.adminMarkup }
          );
        } else {
          // Для курьера используем обычный TelegramService
          await TelegramService.call(
            options.adminMsg,
            options.adminTgId,
            { markup: options.adminMarkup }
          );
        }
      }

      // Удаляем предыдущее сообщение пользователя если есть
      if (order.msg_id && order.users.tg_id) {
        await this.removePreviousMessage(order.users.tg_id.toString(), order.msg_id.toString());
      }

      // Отправляем сообщение пользователю
      if (options.userMsg && options.userTgId) {
        const msgId = await TelegramService.call(
          options.userMsg,
          options.userTgId,
          { markup: options.userMarkup }
        );

                 // Сохраняем ID сообщения в заказе
         if (typeof msgId === 'number') {
           await prisma.orders.update({
             where: { id: order.id },
             data: { msg_id: msgId }
           });
         } else if (msgId instanceof Error) {
           await this.notifyAdmin(msgId, order.id.toString());
         }
      }
    } catch (error) {
      console.error('Error in sendReport:', error);
      if (error instanceof Error) {
        await this.notifyAdmin(error, order.id.toString());
      }
    }
  }

  /**
   * Удаление предыдущего сообщения
   */
  private static async removePreviousMessage(tgId: string, msgId: string): Promise<void> {
    // Реализация удаления сообщения через TelegramMsgDelService
    // В данном случае можно пропустить или реализовать отдельно
    console.log(`🗑️ Should remove message ${msgId} for user ${tgId}`);
  }

  /**
   * Уведомление админа об ошибке
   */
  private static async notifyAdmin(error: Error, orderId: string): Promise<void> {
    const msg = `❌ Клиенту не пришло бизнес сообщение по заказу ${orderId}`;
    
    if (error.message.includes('chat not found')) {
      await TelegramService.call(
        `${msg} по причине не нажатия на старт!`,
        process.env.TELEGRAM_ADMIN_ID
      );
    } else if (error.message.includes('bot was blocked')) {
      await TelegramService.call(
        `${msg} по причине добавления им бота в бан!`,
        process.env.TELEGRAM_ADMIN_ID
      );
    } else {
      console.error(`${msg} по причине: ${error.message}`);
      // В реальном проекте здесь можно отправить email или другое уведомление
    }
  }

  /**
   * Форматирование списка товаров как в рабочем боте
   */
  private static formatOrderItems(orderItems: OrderForReport['order_items'], withPrices: boolean = false): string {
    return orderItems.map(item => {
      // Формат как в рабочем боте: "• Atominex 18 mg — 1шт. — 5200₽"
      return `• ${item.products.name} — ${item.quantity}шт. — ${item.price}₽`;
    }).join('\n');
  }

  /**
   * Получение полного имени пользователя
   */
  private static getFullName(user: OrderForReport['users']): string {
    // Используем основные поля, а не _raw поля
    const firstName = (user as any).first_name || user.first_name_raw || '';
    const lastName = (user as any).last_name || user.last_name_raw || '';
    const middleName = (user as any).middle_name || '';
    
    return `${firstName} ${lastName} ${middleName}`.trim() || 'Не указано';
  }

  /**
   * Построение полного адреса как в рабочем боте
   */
  private static buildFullAddress(order: OrderForReport): string {
    // Используем customeraddress из заказа если есть
    if (order.customeraddress) {
      return order.customeraddress;
    }
    
    // Fallback к адресу пользователя
    const user = order.users;
    const parts = [];
    
    // Формируем адрес с индексом как в рабочем боте
    if (user.postal_code) parts.push(`${user.postal_code}`);
    if (user.address) parts.push(user.address);
    
    return parts.join(', ') || 'Адрес не указан';
  }
} 