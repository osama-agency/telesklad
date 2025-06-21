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

export class TelegramWebappBotService {
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
   * Редактировать сообщение
   */
  private static async editMessage(chatId: string, messageId: number, text: string, replyMarkup?: any): Promise<any> {
    try {
      const response = await fetch(`${this.WEBAPP_API_URL}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('❌ [WEBAPP BOT] Edit error:', error);
      return null;
    }
  }

  /**
   * Удалить сообщение
   */
  private static async deleteMessage(chatId: string, messageId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.WEBAPP_API_URL}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('❌ [WEBAPP BOT] Delete error:', error);
      return false;
    }
  }

  /**
   * 🎉 UNPAID - Заказ создан, отправляем клиенту
   */
  static async sendOrderCreated(order: OrderData, user: UserData, settings: any): Promise<{ success: boolean; messageId?: number }> {
    const webappUrl = `https://t.me/${settings.webapp_bot_username || 'your_webapp_bot'}?startapp`;
    
    const orderItems = order.items.map(item => 
      `• ${item.product_name} — ${item.quantity}шт. — ${item.price}₽`
    ).join('\n');

    const bonusText = order.bonus && order.bonus > 0 ? `\n💰 <b>Использовано бонусов:</b> ${order.bonus}₽` : '';

    const message: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: `🎉 <b>Ваш заказ №${order.id} принят!</b>

📌 <b>Проверьте заказ перед оплатой:</b>

<b>Состав заказа:</b>
${orderItems}${bonusText}

<b>Данные для доставки:</b>
👤 ${user.full_name}
🏠 ${user.full_address}${user.postal_code ? `, ${user.postal_code}` : ''}
📞 ${user.phone_number}

💰 <b>Сумма к оплате: ${order.total_amount}₽</b>

✅ <b>Дальнейшие действия:</b>
1. Сделайте перевод на карту:
<code>${settings.bank_card_details || 'Карта не настроена'}</code>

2. Нажмите кнопку «Я оплатил»

❗️ Если заметили ошибку — нажмите «Изменить заказ»`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💳 Я оплатил', callback_data: `order_paid_${order.id}` }],
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
    // Клиенту - уведомление о проверке
    const clientMessage: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: `⏳ <b>Идет проверка вашего перевода</b>

Заказ №${order.id}

Пожалуйста, ожидайте - как только мы подтвердим оплату, вы получите уведомление здесь.

⏰ <b>Примерное время ожидания:</b> от 5 до 30 минут.`,
      parse_mode: 'HTML'
    };

    // Администратору - запрос на подтверждение
    const orderItems = order.items.map(item => 
      `• ${item.product_name} — ${item.quantity}шт. — ${item.price}₽`
    ).join('\n');

    const adminMessage: WebappTelegramMessage = {
      chat_id: this.ADMIN_CHAT_ID,
      text: `💰 <b>Нужно проверить оплату заказа №${order.id}</b>

<b>Итого отправил клиент:</b> ${order.total_amount}₽
<b>Банковская карта:</b> ${settings.bank_card_details || 'Не настроена'}

📄 <b>Состав заказа:</b>
${orderItems}

📍 <b>Адрес доставки:</b>
${user.full_address}${user.postal_code ? `, ${user.postal_code}` : ''}

👤 <b>ФИО:</b> ${user.full_name}
📱 <b>Телефон:</b> ${user.phone_number}`,
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

    // Клиенту - подтверждение
    const clientMessage: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: `❤️ <b>Благодарим вас за покупку!</b>

🚚 Заказ №${order.id} находится у курьера и готовится к отправке.

Как только посылка будет отправлена, мы незамедлительно вышлем вам трек-номер для отслеживания.

⏰ <b>Процесс отправки:</b> от 5 до 48 часов.

Будем признательны за ваше терпение! 😊`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Новый заказ', web_app: { url: webappUrl }}]
        ]
      }
    };

    // Курьеру - задание на отправку
    const orderItemsForCourier = order.items.map(item => 
      `• ${item.product_name} — ${item.quantity}шт.`
    ).join('\n');

    const courierMessage: WebappTelegramMessage = {
      chat_id: this.COURIER_CHAT_ID,
      text: `👀 <b>Нужно отправить заказ №${order.id}</b>

📄 <b>Состав заказа:</b>
${orderItemsForCourier}

📍 <b>Адрес:</b> <code>${user.full_address}</code>
📍 <b>Индекс:</b> <code>${user.postal_code || 'Не указан'}</code>
👤 <b>ФИО:</b> <code>${user.full_name}</code>
📱 <b>Телефон:</b> <code>${user.phone_number}</code>

🌟━━━━━━━━━━━━🌟`,
      parse_mode: 'HTML',
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

    // Клиенту - трек-номер
    const clientMessage: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: `✅ <b>Заказ №${order.id}</b>

📦 <b>Посылка отправлена!</b>

🔍 <b>Ваш трек-номер:</b> <code>${trackingNumber}</code>

📄 <b>Состав заказа:</b>
${orderItems}

📍 <b>Адрес доставки:</b>
${user.full_address}

👤 <b>ФИО:</b> ${user.full_name}
📱 <b>Телефон:</b> ${user.phone_number}

Спасибо за покупку! 😊`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Сделать новый заказ', web_app: { url: `https://t.me/${process.env.WEBAPP_BOT_USERNAME || 'your_webapp_bot'}?startapp` }}]
        ]
      }
    };

    // Курьеру - подтверждение
    const courierConfirmMessage: WebappTelegramMessage = {
      chat_id: this.COURIER_CHAT_ID,
      text: `✅ <b>Готово! Трек-номер отправлен клиенту.</b>

📦 <b>Трек-номер:</b> ${trackingNumber}
🆔 <b>Заказ №${order.id}</b>
👤 <b>Клиент:</b> ${user.full_name}`,
      parse_mode: 'HTML'
    };

    const [clientResult, courierResult] = await Promise.all([
      this.sendMessage(clientMessage),
      this.sendMessage(courierConfirmMessage)
    ]);

    // Планируем запрос отзывов через 10 дней
    setTimeout(() => {
      this.sendReviewRequest(order, user);
    }, 10 * 24 * 60 * 60 * 1000); // 10 дней

    return !!(clientResult && courierResult);
  }

  /**
   * ❌ CANCELLED - Заказ отменен
   */
  static async sendOrderCancelled(order: OrderData, user: UserData, reason?: string): Promise<boolean> {
    const message: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: `❌ <b>Ваш заказ №${order.id} отменён</b>

${reason ? `<b>Причина:</b> ${reason}\n\n` : ''}Если вы хотите оформить новый заказ, повторите покупку через каталог.`,
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
   * ⏰ Напоминание об оплате
   */
  static async sendPaymentReminder(order: OrderData, user: UserData, reminderType: 'first' | 'final'): Promise<boolean> {
    const messages = {
      first: `⏰ <b>Напоминаем об оплате заказа №${order.id}</b>

Ваш заказ всё ещё ждёт подтверждения оплаты.

💳 Переведите ${order.total_amount}₽ на карту:
<code>${process.env.BANK_CARD_DETAILS || 'Карта не настроена'}</code>

Затем нажмите "Я оплатил" 👇`,
      
      final: `⚠️ <b>Ваш заказ №${order.id} может быть отменён</b>

Мы всё ещё не получили оплату за ваш заказ. Если оплата не поступит в течение 3 часов, резерв будет снят, и заказ будет отменён.

💳 Срочно переведите ${order.total_amount}₽ на карту:
<code>${process.env.BANK_CARD_DETAILS || 'Карта не настроена'}</code>`
    };

    const message: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: messages[reminderType],
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💳 Я оплатил', callback_data: `order_paid_${order.id}` }]
        ]
      }
    };

    const result = await this.sendMessage(message);
    return !!result;
  }

  /**
   * 📝 Запрос отзыва через 10 дней
   */
  static async sendReviewRequest(order: OrderData, user: UserData): Promise<boolean> {
    const message: WebappTelegramMessage = {
      chat_id: user.tg_id,
      text: `📝 <b>Как вам наши товары?</b>

Здравствуйте! Все ли прошло хорошо с доставкой заказа №${order.id}?

<b>Нам очень важно ваше мнение!</b>

Пожалуйста, оставьте отзыв о товарах - это поможет другим покупателям сделать правильный выбор.`,
      parse_mode: 'HTML',
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
   * Обработка callback'ов для заказов
   */
  static async handleOrderCallback(callbackQuery: any): Promise<boolean> {
    const { id: callbackQueryId, data: callbackData, from, message } = callbackQuery;
    
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

        case 'track':
          // Курьер привязывает трек-номер
          if (from.id.toString() !== this.COURIER_CHAT_ID) {
            await this.answerCallbackQuery(callbackQueryId, 'У вас нет прав для этого действия');
            return false;
          }
          await this.answerCallbackQuery(callbackQueryId, 'Введите трек-номер в следующем сообщении');
          await this.requestTrackingNumber(orderId, from.id, message);
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
   * Запросить трек-номер у курьера
   */
  private static async requestTrackingNumber(orderId: number, courierId: number, message: any): Promise<void> {
    // Сохраняем состояние ожидания трек-номера
    const state = {
      orderId,
      messageId: message.message_id,
      waitingForTrack: true,
      timestamp: Date.now()
    };

    // Временное хранение состояний (в продакшене лучше использовать Redis)
    (global as any).courierStates = (global as any).courierStates || new Map();
    (global as any).courierStates.set(courierId, state);

    const promptMessage: WebappTelegramMessage = {
      chat_id: courierId,
      text: `📦 <b>Введите трек-номер для заказа №${orderId}</b>

Отправьте трек-номер следующим сообщением.`,
      parse_mode: 'HTML'
    };

    await this.sendMessage(promptMessage);
  }

  /**
   * Обработать ввод трек-номера
   */
  static async handleTrackingNumberInput(message: any): Promise<boolean> {
    const courierId = message.from.id;
    const trackingNumber = message.text.trim();

    const state = (global as any).courierStates?.get(courierId);
    
    if (!state || !state.waitingForTrack) {
      return false; // Не ожидаем трек-номер от этого курьера
    }

    try {
      // Обновляем заказ с трек-номером
      await this.callOrderTrackingAPI(state.orderId, trackingNumber);
      
      // Удаляем состояние ожидания
      (global as any).courierStates.delete(courierId);
      
      // Подтверждаем курьеру
      const confirmMessage: WebappTelegramMessage = {
        chat_id: courierId,
        text: `✅ <b>Трек-номер сохранен!</b>

📦 <b>Трек:</b> ${trackingNumber}
🆔 <b>Заказ №${state.orderId}</b>

Клиент получил уведомление с трек-номером.`,
        parse_mode: 'HTML'
      };

      await this.sendMessage(confirmMessage);
      return true;
    } catch (error) {
      console.error('❌ [WEBAPP BOT] Track input error:', error);
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
   * Вызвать API для добавления трек-номера
   */
  private static async callOrderTrackingAPI(orderId: number, trackingNumber: string): Promise<void> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3009';
      const response = await fetch(`${baseUrl}/api/webapp/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_number: trackingNumber }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      console.log(`✅ [WEBAPP BOT] Order #${orderId} tracking updated: ${trackingNumber}`);
    } catch (error) {
      console.error(`❌ [WEBAPP BOT] Failed to update tracking #${orderId}:`, error);
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

  /**
   * Отправить первое приветственное сообщение
   */
  static async sendWelcomeMessage(userId: string, settings: any): Promise<boolean> {
    const webappUrl = `https://t.me/${settings.webapp_bot_username || 'your_webapp_bot'}?startapp`;
    
    const message: WebappTelegramMessage = {
      chat_id: userId,
      text: settings.welcome_message || `🛒 <b>Добро пожаловать в наш магазин!</b>

Здесь вы можете заказать товары с доставкой.

Нажмите кнопку ниже, чтобы открыть каталог товаров.`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Открыть каталог', web_app: { url: webappUrl }}],
          [{ text: '❓ Поддержка', url: settings.support_url || 'https://t.me/support' }]
        ]
      }
    };

    const result = await this.sendMessage(message);
    return !!result;
  }
} 