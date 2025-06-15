interface TelegramMessage {
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
  web_app?: {
    url: string;
  };
  url?: string;
}

interface Purchase {
  id: number;
  totalAmount: number;
  status: string;
  isUrgent: boolean;
  items: {
    productName: string;
    quantity: number;
    costPrice: number;
    total: number;
  }[];
  createdAt: string;
}

export class TelegramBotService {
  private static readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  private static readonly API_URL = `https://api.telegram.org/bot${TelegramBotService.BOT_TOKEN}`;
  
  // ID чатов (пока все сообщения отправляются администратору для тестирования)
  private static readonly SUPPLIER_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '125861752'; // Временно: администратор
  private static readonly ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '125861752'; // Администратор

  /**
   * Отправить сообщение в Telegram
   */
  private static async sendMessage(message: TelegramMessage): Promise<any> {
    if (!this.BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return null;
    }
  }

  /**
   * Обновить сообщение в Telegram
   */
  private static async editMessage(chatId: number | string, messageId: number, text: string, replyMarkup?: any): Promise<any> {
    if (!this.BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return null;
    }

    try {
      const response = await fetch(`${this.API_URL}/editMessageText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error editing Telegram message:', error);
      return null;
    }
  }

  /**
   * Форматировать закупку для отображения
   */
  private static formatPurchase(purchase: Purchase): string {
    const items = purchase.items
      .map(item => `• ${item.productName} - ${item.quantity} шт. × ${item.costPrice} ₺ = ${item.total} ₺`)
      .join('\n');

    const urgentTag = purchase.isUrgent ? '🔴 СРОЧНО! ' : '';
    const status = this.getStatusText(purchase.status);
    const testTag = '🧪 <i>(ТЕСТОВЫЙ РЕЖИМ)</i>';

    return `${urgentTag}<b>Закупка #${purchase.id}</b> ${testTag}
<b>Статус:</b> ${status}

<b>Товары:</b>
${items}

<b>Общая сумма:</b> ${purchase.totalAmount} ₺
<b>Дата создания:</b> ${new Date(purchase.createdAt).toLocaleString('ru-RU')}

<i>📝 В тестовом режиме все сообщения отправляются администратору</i>`;
  }

  /**
   * Получить текст статуса
   */
  private static getStatusText(status: string): string {
    switch (status) {
      case 'draft': return '🗒️ Черновик';
      case 'sent': return '📤 Отправлено';

      case 'awaiting_payment': return '💳 Ожидает оплату';
      case 'paid': return '💰 Оплачено';
      case 'in_transit': return '🚚 В пути';
      case 'received': return '✅ Получено';
      case 'cancelled': return '❌ Отменено';
      default: return status;
    }
  }

  /**
   * Отправить новую закупку закупщику
   */
  static async sendPurchaseToSupplier(purchase: Purchase): Promise<{ success: boolean; messageId?: number }> {
    if (!this.SUPPLIER_CHAT_ID) {
      console.error('TELEGRAM_SUPPLIER_CHAT_ID not configured');
      return { success: false };
    }

    const webAppUrl = `${process.env.NEXTAUTH_URL}/telegram-webapp/purchase-editor.html?purchaseId=${purchase.id}`;

    const message: TelegramMessage = {
      chat_id: this.SUPPLIER_CHAT_ID,
      text: this.formatPurchase({ ...purchase, status: 'sent' }),
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📝 Редактировать',
              web_app: {
                url: webAppUrl
              }
            }
          ]
        ]
      }
    };

    const result = await this.sendMessage(message);
    
    if (result && result.ok) {
      return { success: true, messageId: result.result.message_id };
    }
    
    return { success: false };
  }

  /**
   * Уведомить администратора о готовности к оплате
   */
  static async notifyAdminPaymentReady(purchase: Purchase, messageId?: number): Promise<boolean> {
    if (!this.ADMIN_CHAT_ID) {
      console.error('TELEGRAM_ADMIN_CHAT_ID not configured');
      return false;
    }

    const adminMessage: TelegramMessage = {
      chat_id: this.ADMIN_CHAT_ID,
      text: `💰 <b>Закупка готова к оплате!</b>

${this.formatPurchase({ ...purchase, status: 'awaiting_payment' })}

Закупщик собрал товары и ожидает оплаты.`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '✅ Оплатил',
              callback_data: `pay_purchase_${purchase.id}_${messageId || ''}`
            }
          ]
        ]
      }
    };

    const result = await this.sendMessage(adminMessage);
    return result && result.ok;
  }

  /**
   * Обновить статус закупки у закупщика
   */
  static async updateSupplierPurchaseStatus(
    chatId: number | string, 
    messageId: number, 
    purchase: Purchase
  ): Promise<boolean> {
    let keyboard: InlineKeyboardButton[][] = [];

    if (purchase.status === 'sent') {
      const webAppUrl = `${process.env.NEXTAUTH_URL}/telegram-webapp/purchase-editor.html?purchaseId=${purchase.id}&messageId=${messageId}`;
      keyboard = [
        [
          {
            text: '📝 Редактировать',
            web_app: {
              url: webAppUrl
            }
          }
        ]
      ];
    } else if (purchase.status === 'paid') {
      keyboard = [
        [
          {
            text: '🚚 Передали в карго',
            callback_data: `ship_to_cargo_${purchase.id}_${messageId}`
          }
        ]
      ];
    }

    const result = await this.editMessage(
      chatId,
      messageId,
      this.formatPurchase(purchase),
      { inline_keyboard: keyboard }
    );

    return result && result.ok;
  }

  /**
   * Обработка callback от кнопок
   */
  static async handleCallback(callbackQuery: any): Promise<boolean> {
    const { data, message, from } = callbackQuery;
    
    if (!data || !message) return false;

    try {
      if (data.startsWith('pay_purchase_')) {
        // Обработка оплаты администратором
        const parts = data.split('_');
        const purchaseId = parseInt(parts[2]);
        const supplierMessageId = parts[3] ? parseInt(parts[3]) : null;

        // Обновляем статус в базе данных
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/purchases/${purchaseId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'paid' }),
        });

        if (response.ok) {
          const purchase = await response.json();
          
          // Обновляем сообщение у закупщика
          if (supplierMessageId && this.SUPPLIER_CHAT_ID) {
            await this.updateSupplierPurchaseStatus(
              this.SUPPLIER_CHAT_ID,
              supplierMessageId,
              purchase
            );
          }

          // Отвечаем администратору
          await this.answerCallbackQuery(callbackQuery.id, '✅ Закупка помечена как оплаченная!');
          
          return true;
        }
      } else if (data.startsWith('ship_to_cargo_')) {
        // Обработка передачи в карго
        const parts = data.split('_');
        const purchaseId = parseInt(parts[3]);
        const messageId = parseInt(parts[4]);

        // Обновляем статус в базе данных
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/purchases/${purchaseId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'in_transit' }),
        });

        if (response.ok) {
          const purchase = await response.json();
          
          // Обновляем сообщение
          await this.updateSupplierPurchaseStatus(
            message.chat.id,
            messageId,
            purchase
          );

          // Уведомляем администратора
          if (this.ADMIN_CHAT_ID) {
            await this.sendMessage({
              chat_id: this.ADMIN_CHAT_ID,
              text: `🚚 <b>Товары переданы в карго!</b>\n\n${this.formatPurchase(purchase)}`,
              parse_mode: 'HTML'
            });
          }

          await this.answerCallbackQuery(callbackQuery.id, '🚚 Товары помечены как переданные в карго!');
          
          return true;
        }
      }
    } catch (error) {
      console.error('Error handling callback:', error);
      await this.answerCallbackQuery(callbackQuery.id, '❌ Произошла ошибка. Попробуйте позже.');
    }
    
    return false;
  }

  /**
   * Ответить на callback query
   */
  private static async answerCallbackQuery(callbackQueryId: string, text: string): Promise<void> {
    if (!this.BOT_TOKEN) return;

    try {
      await fetch(`${this.API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: false,
        }),
      });
    } catch (error) {
      console.error('Error answering callback query:', error);
    }
  }
} 