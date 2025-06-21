import { TelegramMessageTemplatesService } from './telegram-message-templates.service';

interface WebappTelegramMessage {
  chat_id: number | string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: {
    inline_keyboard: InlineKeyboardButton[][];
  };
}

interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  web_app?: { url: string };
  url?: string;
}

interface OrderData {
  id: number;
  total_amount: number;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  bonus?: number;
}

interface UserData {
  tg_id: string;
  full_name: string;
  full_address: string;
  phone_number: string;
  postal_code?: number;
}

export class WebappTelegramBotService {
  // WEBAPP БОТ - для клиентов и заказов
  private static readonly WEBAPP_BOT_TOKEN = '7754514670:AAFswWZxch4OwaLcmQp7LMzr6E3AdJ5woPg';
  private static readonly WEBAPP_API_URL = `https://api.telegram.org/bot${this.WEBAPP_BOT_TOKEN}`;
  
  // ID для webapp бота (можно настроить через env)
  private static readonly ADMIN_CHAT_ID = process.env.WEBAPP_ADMIN_CHAT_ID || '125861752';
  private static readonly COURIER_CHAT_ID = process.env.WEBAPP_COURIER_CHAT_ID || '7828956680';
  private static readonly GROUP_CHAT_ID = process.env.WEBAPP_GROUP_CHAT_ID || '-4729817036';

  /**
   * Отправить сообщение через webapp бота
   */
  private static async sendMessage(message: WebappTelegramMessage): Promise<any> {
    if (!this.WEBAPP_BOT_TOKEN) {
      console.error('❌ TELEGRAM_WEBAPP_BOT_TOKEN not configured');
      return null;
    }

    // В режиме разработки логируем но не отправляем реально
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 [WEBAPP BOT DEV] Would send to ${message.chat_id}:`);
      console.log(`📝 Message: ${message.text.substring(0, 200)}...`);
      return {
        ok: true,
        result: {
          message_id: Math.floor(Math.random() * 10000),
          chat: { id: message.chat_id },
          date: Math.floor(Date.now() / 1000),
          text: message.text
        }
      };
    }

    try {
      console.log(`📤 [WEBAPP BOT] Sending to ${message.chat_id}:`, message.text.substring(0, 100));
      
      const response = await fetch(`${this.WEBAPP_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webapp Bot API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [WEBAPP BOT] Message sent, ID:', result.result?.message_id);
      
      return result;
    } catch (error) {
      console.error('❌ [WEBAPP BOT] Send error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 🎉 UNPAID - Заказ создан, отправляем клиенту (точно как в Rails project)
   */
  static async sendOrderCreated(order: OrderData, user: UserData, settings: any): Promise<{ success: boolean; messageId?: number }> {
    const webappUrl = `https://t.me/${settings.webapp_bot_username || 'your_webapp_bot'}?startapp`;
    
    const orderItems = order.items.map(item => 
      `• ${item.product_name} — ${item.quantity}шт. — ${item.price}₽`
    ).join('\n');

    // Используем шаблоны из базы данных (аналог Rails I18n.t)
    const msgHeader = await TelegramMessageTemplatesService.getMessage('unpaid_msg', { order: order.id });
    const msgBody = await TelegramMessageTemplatesService.getMessage('unpaid_main', {
      items: orderItems,
      fio: user.full_name,
      address: user.full_address,
      postal_code: user.postal_code || 'Не указан',
      phone: user.phone_number,
      price: order.total_amount,
      card: settings.bank_card_details || 'Карта не настроена'
    });

    const fullMessage = `${msgHeader}\n\n${msgBody}`;

    const message: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: fullMessage,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Я оплатил', callback_data: `order_paid_${order.id}` }],
          [{ text: '📝 Изменить заказ', web_app: { url: webappUrl }}],
          [{ text: '❓ Задать вопрос', url: settings.support_url || 'https://t.me/support' }]
        ]
      }
    };

    const result = await this.sendMessage(message);
    
    if (result && result.result) {
      return { success: true, messageId: result.result.message_id };
    }
    
    return { success: false };
  }

  /**
   * 💳 PAID - Клиент нажал "Я оплатил"
   */
  static async sendPaymentReceived(order: OrderData, user: UserData, settings: any): Promise<boolean> {
    // Клиенту - уведомление о проверке (из базы данных)
    const clientText = await TelegramMessageTemplatesService.getMessage('paid_client');
    
    const clientMessage: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: clientText,
      parse_mode: 'HTML'
    };

    // Администратору - запрос на подтверждение (из базы данных)
    const orderItems = order.items.map(item => 
      `• ${item.product_name} — ${item.quantity}шт. — ${item.price}₽`
    ).join('\n');

    const adminText = await TelegramMessageTemplatesService.getMessage('paid_admin', {
      order: order.id,
      price: order.total_amount,
      card: settings.bank_card_details || 'Не настроена',
      items: orderItems,
      address: user.full_address,
      fio: user.full_name,
      phone: user.phone_number
    });

    const adminMessage: WebappTelegramMessage = {
      chat_id: this.ADMIN_CHAT_ID,
      text: adminText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Оплата пришла', callback_data: `order_approve_${order.id}` },
            { text: '❌ Отменить заказ', callback_data: `order_cancel_${order.id}` }
          ]
        ]
      }
    };

    const [clientResult, adminResult] = await Promise.all([
      this.sendMessage(clientMessage),
      this.sendMessage(adminMessage)
    ]);

    return !!(clientResult && adminResult);
  }

  /**
   * ✅ PROCESSING - Оплата подтверждена
   */
  static async sendOrderProcessing(order: OrderData, user: UserData, settings: any): Promise<boolean> {
    const webappUrl = `https://t.me/${settings.webapp_bot_username || 'your_webapp_bot'}?startapp`;

    // Клиенту - подтверждение (из базы данных)
    const clientText = await TelegramMessageTemplatesService.getMessage('on_processing_client', {
      order: order.id
    });

    const clientMessage: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: clientText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Новый заказ', web_app: { url: webappUrl }}]
        ]
      }
    };

    // Курьеру - задание на отправку (из базы данных)
    const orderItemsForCourier = order.items.map(item => 
      `• ${item.product_name} — ${item.quantity}шт.`
    ).join('\n');

    const courierText = await TelegramMessageTemplatesService.getMessage('on_processing_courier', {
      order: order.id,
      items: orderItemsForCourier,
      address: user.full_address,
      postal_code: user.postal_code || 'Не указан',
      fio: user.full_name,
      phone: user.phone_number
    });

    const courierMessage: WebappTelegramMessage = {
      chat_id: this.COURIER_CHAT_ID,
      text: courierText,
      parse_mode: 'Markdown', // Для поддержки backticks `text` в шаблоне
      reply_markup: {
        inline_keyboard: [
          [{ text: '📦 Привязать трек-номер', callback_data: `order_track_${order.id}` }]
        ]
      }
    };

    const [clientResult, courierResult] = await Promise.all([
      this.sendMessage(clientMessage),
      this.sendMessage(courierMessage)
    ]);

    return !!(clientResult && courierResult);
  }

  /**
   * 📦 SHIPPED - Заказ отправлен с трек-номером
   */
  static async sendOrderShipped(order: OrderData, user: UserData, trackingNumber: string): Promise<boolean> {
    const orderItems = order.items.map(item => 
      `• ${item.product_name} — ${item.quantity}шт. — ${item.price}₽`
    ).join('\n');

    // Клиенту - трек-номер (из базы данных)
    const clientText = await TelegramMessageTemplatesService.getMessage('on_shipped_courier', {
      order: order.id,
      track: trackingNumber,
      items: orderItems,
      address: user.full_address,
      fio: user.full_name,
      phone: user.phone_number
    });

    const clientMessage: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: clientText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Сделать новый заказ', web_app: { url: `https://t.me/${process.env.WEBAPP_BOT_USERNAME || 'your_webapp_bot'}?startapp` }}]
        ]
      }
    };

    // Курьеру - подтверждение (из базы данных)
    const courierText = await TelegramMessageTemplatesService.getMessage('track_num_save', {
      num: trackingNumber,
      order: order.id,
      fio: user.full_name
    });

    const courierConfirmMessage: WebappTelegramMessage = {
      chat_id: this.COURIER_CHAT_ID,
      text: courierText,
      parse_mode: 'HTML'
    };

    const [clientResult, courierResult] = await Promise.all([
      this.sendMessage(clientMessage),
      this.sendMessage(courierConfirmMessage)
    ]);

    return !!(clientResult && courierResult);
  }

  /**
   * ❌ CANCELLED - Заказ отменен
   */
  static async sendOrderCancelled(order: OrderData, user: UserData, reason?: string): Promise<boolean> {
    // Используем шаблон из базы данных
    const cancelText = await TelegramMessageTemplatesService.getMessage('cancel', {
      order: order.id
    });

    // Добавляем причину отмены если она есть
    const fullText = reason ? `${reason}\n\n${cancelText}` : cancelText;

    const message: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: fullText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Новый заказ', web_app: { url: `https://t.me/${process.env.WEBAPP_BOT_USERNAME || 'your_webapp_bot'}?startapp` }}]
        ]
      }
    };

    const result = await this.sendMessage(message);
    return !!result;
  }

  /**
   * ⏰ Напоминание об оплате (точно как в Rails)
   */
  static async sendPaymentReminder(order: OrderData, user: UserData, reminderType: 'one' | 'two' | 'overdue'): Promise<boolean> {
    let messageText = '';
    let replyMarkup: any = undefined;

    switch (reminderType) {
      case 'one':
        messageText = await TelegramMessageTemplatesService.getMessage('unpaid_reminder_one', {
          order: order.id
        });
        replyMarkup = {
          inline_keyboard: [
            [{ text: 'Я оплатил', callback_data: `order_paid_${order.id}` }]
          ]
        };
        break;

      case 'two':
        messageText = await TelegramMessageTemplatesService.getMessage('unpaid_reminder_two', {
          order: order.id
        });
        replyMarkup = {
          inline_keyboard: [
            [{ text: 'Я оплатил', callback_data: `order_paid_${order.id}` }]
          ]
        };
        break;

      case 'overdue':
        messageText = await TelegramMessageTemplatesService.getMessage('unpaid_reminder_overdue', {
          order: order.id
        });
        replyMarkup = {
          inline_keyboard: [
            [{ text: '🛒 Новый заказ', web_app: { url: `https://t.me/${process.env.WEBAPP_BOT_USERNAME || 'your_webapp_bot'}?startapp` }}]
          ]
        };
        break;
    }

    const message: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: messageText,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    };

    const result = await this.sendMessage(message);
    return !!result;
  }

  /**
   * 📝 Запрос отзыва через 10 дней (точно как в Rails)
   */
  static async sendReviewRequest(order: OrderData, user: UserData, product?: string): Promise<boolean> {
    const templateKey = product === 'mirena' ? 'review_mirena' : 'review';
    
    const reviewText = await TelegramMessageTemplatesService.getMessage(templateKey, {
      product: product || 'товара'
    });

    const message: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: reviewText,
      parse_mode: 'Markdown', // Для поддержки *bold* в шаблоне
      reply_markup: {
        inline_keyboard: [
          [{ text: '⭐ Оставить отзыв', web_app: { url: `https://t.me/${process.env.WEBAPP_BOT_USERNAME || 'your_webapp_bot'}?startapp=reviews` }}]
        ]
      }
    };

    const result = await this.sendMessage(message);
    return !!result;
  }

  /**
   * 📦 Запрос трек-номера у курьера (точно как в Rails)
   */
  static async requestTrackingNumber(orderId: number, user: UserData): Promise<boolean> {
    const trackText = await TelegramMessageTemplatesService.getMessage('set_track_num', {
      order: orderId,
      fio: user.full_name
    });

    // Сохраняем состояние ожидания трек-номера
    const state = {
      orderId,
      waitingForTrack: true,
      timestamp: Date.now()
    };

    // Временное хранение состояний (в продакшене лучше использовать Redis)
    (global as any).courierStates = (global as any).courierStates || new Map();
    (global as any).courierStates.set(this.COURIER_CHAT_ID, state);

    const promptMessage: WebappTelegramMessage = {
      chat_id: this.COURIER_CHAT_ID,
      text: trackText,
      parse_mode: 'HTML'
    };

    const result = await this.sendMessage(promptMessage);
    return !!result;
  }

  /**
   * 🎉 Уведомление админу об успешной оплате (точно как в Rails)
   */
  static async sendPaymentApprovalNotification(order: OrderData, user: UserData): Promise<boolean> {
    const approvalText = await TelegramMessageTemplatesService.getMessage('approved_pay', {
      order: order.id,
      fio: user.full_name
    });

    const message: WebappTelegramMessage = {
      chat_id: this.ADMIN_CHAT_ID,
      text: approvalText,
      parse_mode: 'HTML'
    };

    const result = await this.sendMessage(message);
    return !!result;
  }

  /**
   * Обработка callback'ов для заказов
   */
  static async handleOrderCallback(callbackQuery: any): Promise<boolean> {
    const { id: callbackQueryId, data: callbackData, from } = callbackQuery;
    
    console.log(`🔄 [WEBAPP BOT] Handling callback: ${callbackData} from user ${from.id}`);

    if (!callbackData || !callbackData.startsWith('order_')) {
      await this.answerCallbackQuery(callbackQueryId, 'Неизвестная команда');
      return false;
    }

    try {
      const [action, subAction, orderIdStr] = callbackData.split('_');
      const orderId = parseInt(orderIdStr);

      if (isNaN(orderId)) {
        await this.answerCallbackQuery(callbackQueryId, 'Неверный ID заказа');
        return false;
      }

      switch (subAction) {
        case 'paid':
          // Клиент нажал "Я оплатил"
          await this.answerCallbackQuery(callbackQueryId, 'Уведомляем о поступлении оплаты...');
          await this.callOrderStatusAPI(orderId, 'paid');
          break;

        case 'approve':
          // Админ подтвердил оплату
          if (from.id.toString() !== this.ADMIN_CHAT_ID) {
            await this.answerCallbackQuery(callbackQueryId, 'У вас нет прав для этого действия');
            return false;
          }
          await this.answerCallbackQuery(callbackQueryId, 'Подтверждаем оплату...');
          await this.callOrderStatusAPI(orderId, 'processing');
          break;

        case 'cancel':
          // Админ отменил заказ
          if (from.id.toString() !== this.ADMIN_CHAT_ID) {
            await this.answerCallbackQuery(callbackQueryId, 'У вас нет прав для этого действия');
            return false;
          }
          await this.answerCallbackQuery(callbackQueryId, 'Отменяем заказ...');
          await this.callOrderStatusAPI(orderId, 'cancelled');
          break;

        default:
          await this.answerCallbackQuery(callbackQueryId, 'Неизвестное действие');
          return false;
      }

      return true;
    } catch (error) {
      console.error('❌ [WEBAPP BOT] Callback error:', error);
      await this.answerCallbackQuery(callbackQueryId, 'Произошла ошибка при обработке команды');
      return false;
    }
  }

  /**
   * Вызвать API для обновления статуса заказа
   */
  private static async callOrderStatusAPI(orderId: number, newStatus: string): Promise<void> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3009';
      const response = await fetch(`${baseUrl}/api/webapp/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      console.log(`✅ [WEBAPP BOT] Order #${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error(`❌ [WEBAPP BOT] Failed to update order #${orderId}:`, error);
    }
  }

  /**
   * Ответить на callback query
   */
  private static async answerCallbackQuery(callbackQueryId: string, text: string): Promise<void> {
    try {
      await fetch(`${this.WEBAPP_API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: false,
        }),
      });
    } catch (error) {
      console.error('❌ [WEBAPP BOT] Callback answer error:', error);
    }
  }

  /**
   * Получить информацию о webapp боте
   */
  static async getBotInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.WEBAPP_API_URL}/getMe`);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('❌ [WEBAPP BOT] Bot info error:', error);
      return { error: error.message };
    }
  }
} 