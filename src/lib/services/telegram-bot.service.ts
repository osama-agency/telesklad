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
  supplierName?: string;
  notes?: string;
}

export class TelegramBotService {
  private static readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  private static readonly API_URL = `https://api.telegram.org/bot${TelegramBotService.BOT_TOKEN}`;
  
  // Правильные ID из ваших данных
  private static readonly GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID || '-4729817036';
  private static readonly SUPPLIER_ID = process.env.TELEGRAM_SUPPLIER_ID || '7828956680';
  private static readonly ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '125861752';

  /**
   * Отправить сообщение в Telegram
   */
  private static async sendMessage(message: TelegramMessage): Promise<any> {
    if (!this.BOT_TOKEN) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return null;
    }

    try {
      console.log(`📤 Sending message to ${message.chat_id}:`, message.text.substring(0, 100) + '...');
      
      const response = await fetch(`${this.API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Telegram API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Message sent successfully, message_id:', result.result?.message_id);
      return result;
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error);
      return null;
    }
  }

  /**
   * Обновить сообщение в Telegram
   */
  private static async editMessage(chatId: number | string, messageId: number, text: string, replyMarkup?: any): Promise<any> {
    if (!this.BOT_TOKEN) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return null;
    }

    try {
      console.log(`📝 Editing message ${messageId} in chat ${chatId}`);
      
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
        const errorText = await response.text();
        throw new Error(`Telegram API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Message edited successfully');
      return result;
    } catch (error) {
      console.error('❌ Error editing Telegram message:', error);
      return null;
    }
  }

  /**
   * Форматировать закупку для отображения
   */
  private static formatPurchase(purchase: Purchase, showEditButton: boolean = false): string {
    const items = purchase.items
      .map(item => `• ${item.productName} - ${item.quantity} шт. × ${item.costPrice} ₺ = ${item.total} ₺`)
      .join('\n');

    const urgentTag = purchase.isUrgent ? '🔴 СРОЧНО! ' : '';
    const status = this.getStatusText(purchase.status);

    let text = `${urgentTag}<b>Закупка #${purchase.id}</b>
<b>Статус:</b> ${status}

<b>Товары:</b>
${items}

<b>Общая сумма:</b> ${purchase.totalAmount} ₺
<b>Дата создания:</b> ${new Date(purchase.createdAt).toLocaleString('ru-RU')}`;

    if (purchase.supplierName) {
      text += `\n<b>Поставщик:</b> ${purchase.supplierName}`;
    }

    if (purchase.notes) {
      text += `\n<b>Примечания:</b> ${purchase.notes}`;
    }

    return text;
  }

  /**
   * Получить текст статуса
   */
  private static getStatusText(status: string): string {
    switch (status) {
      case 'draft': return '🗒️ Черновик';
      case 'sent_to_supplier': return '📤 Отправлено поставщику';
      case 'supplier_editing': return '✏️ Поставщик редактирует';
      case 'awaiting_payment': return '💳 Ожидает оплату';
      case 'paid': return '💰 Оплачено';
      case 'preparing': return '📦 Готовится к отправке';
      case 'shipped': return '🚚 Отправлено в карго';
      case 'in_transit': return '🛫 В пути';
      case 'delivered': return '✅ Доставлено';
      case 'cancelled': return '❌ Отменено';
      default: return status;
    }
  }

  /**
   * 1. Отправить новую закупку поставщику
   */
  static async sendPurchaseToSupplier(purchase: Purchase): Promise<{ success: boolean; messageId?: number }> {
    console.log(`🚀 Sending purchase #${purchase.id} to supplier ${this.SUPPLIER_ID}`);

    const webAppUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/telegram-webapp/purchase-editor.html?purchaseId=${purchase.id}`;

    const message: TelegramMessage = {
      chat_id: this.SUPPLIER_ID,
      text: `📋 <b>Новая закупка для обработки</b>

${this.formatPurchase({ ...purchase, status: 'sent_to_supplier' })}

<i>Пожалуйста, проверьте товары, отредактируйте количество и цены при необходимости, затем нажмите "Готово к оплате"</i>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📝 Редактировать закупку',
              web_app: {
                url: webAppUrl
              }
            }
          ],
          [
            {
              text: '💰 Готово к оплате',
              callback_data: `purchase_ready_${purchase.id}`
            }
          ]
        ]
      }
    };

    const result = await this.sendMessage(message);
    
    if (result && result.ok) {
      console.log(`✅ Purchase sent to supplier, message_id: ${result.result.message_id}`);
      return { success: true, messageId: result.result.message_id };
    }
    
    console.log('❌ Failed to send purchase to supplier');
    return { success: false };
  }

  /**
   * 2. Уведомить администратора о готовности к оплате
   */
  static async notifyAdminPaymentReady(purchase: Purchase): Promise<{ success: boolean; messageId?: number }> {
    console.log(`💰 Notifying admin about payment ready for purchase #${purchase.id}`);

    const message: TelegramMessage = {
      chat_id: this.ADMIN_ID,
      text: `💰 <b>Закупка готова к оплате!</b>

${this.formatPurchase({ ...purchase, status: 'awaiting_payment' })}

<i>Поставщик подготовил закупку. Необходимо произвести оплату.</i>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '✅ Оплачено',
              callback_data: `purchase_paid_${purchase.id}`
            },
            {
              text: '❌ Отменить',
              callback_data: `purchase_cancel_${purchase.id}`
            }
          ]
        ]
      }
    };

    const result = await this.sendMessage(message);
    
    if (result && result.ok) {
      console.log(`✅ Admin notified about payment, message_id: ${result.result.message_id}`);
      return { success: true, messageId: result.result.message_id };
    }
    
    console.log('❌ Failed to notify admin about payment');
    return { success: false };
  }

  /**
   * 3. Уведомить поставщика об оплате
   */
  static async notifySupplierPaymentConfirmed(purchase: Purchase): Promise<boolean> {
    console.log(`💸 Notifying supplier about payment confirmation for purchase #${purchase.id}`);

    const message: TelegramMessage = {
      chat_id: this.SUPPLIER_ID,
      text: `💸 <b>Оплата подтверждена!</b>

${this.formatPurchase({ ...purchase, status: 'paid' })}

<i>Заказ оплачен. Пожалуйста, подготовьте товары и передайте в карго.</i>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📦 Передано в карго',
              callback_data: `purchase_shipped_${purchase.id}`
            }
          ]
        ]
      }
    };

    const result = await this.sendMessage(message);
    return result && result.ok;
  }

  /**
   * 4. Уведомить в группу о передаче в карго
   */
  static async notifyGroupShipped(purchase: Purchase): Promise<boolean> {
    console.log(`🚚 Notifying group about shipment for purchase #${purchase.id}`);

    const message: TelegramMessage = {
      chat_id: this.GROUP_CHAT_ID,
      text: `🚚 <b>Закупка передана в карго</b>

${this.formatPurchase({ ...purchase, status: 'shipped' })}

<i>Товары переданы в карго и готовы к отправке.</i>`,
      parse_mode: 'HTML'
    };

    const result = await this.sendMessage(message);
    return result && result.ok;
  }

  /**
   * Обновить статус закупки у поставщика
   */
  static async updateSupplierPurchaseStatus(
    chatId: number | string, 
    messageId: number, 
    purchase: Purchase
  ): Promise<boolean> {
    console.log(`📝 Updating supplier message for purchase #${purchase.id}`);

    const webAppUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/telegram-webapp/purchase-editor.html?purchaseId=${purchase.id}`;
    
    let replyMarkup;
    
    if (purchase.status === 'sent_to_supplier' || purchase.status === 'supplier_editing') {
      replyMarkup = {
        inline_keyboard: [
        [
          {
              text: '📝 Редактировать закупку',
            web_app: {
              url: webAppUrl
            }
          }
          ],
          [
            {
              text: '💰 Готово к оплате',
              callback_data: `purchase_ready_${purchase.id}`
            }
        ]
        ]
      };
    } else if (purchase.status === 'paid') {
      replyMarkup = {
        inline_keyboard: [
        [
          {
              text: '📦 Передано в карго',
              callback_data: `purchase_shipped_${purchase.id}`
          }
        ]
        ]
      };
    }

    const text = this.formatPurchase(purchase);
    const result = await this.editMessage(chatId, messageId, text, replyMarkup);
    return result && result.ok;
  }

  /**
   * Обработать callback от кнопок
   */
  static async handleCallback(callbackQuery: any): Promise<boolean> {
    const { id: callbackQueryId, data: callbackData, from, message } = callbackQuery;
    
    console.log(`🔄 Handling callback: ${callbackData} from user ${from.id}`);

    if (!callbackData) {
      await this.answerCallbackQuery(callbackQueryId, 'Неизвестная команда');
      return false;
    }

    try {
      // Парсим callback data
      const [action, ...params] = callbackData.split('_');
      
      if (action === 'purchase') {
        const [subAction, purchaseId] = params;
        const purchaseIdNum = parseInt(purchaseId);

        if (isNaN(purchaseIdNum)) {
          await this.answerCallbackQuery(callbackQueryId, 'Неверный ID закупки');
          return false;
        }

        // Проверяем права пользователя
        const userId = from.id.toString();
        
        switch (subAction) {
          case 'ready':
            // Только поставщик может отметить готовность к оплате
            if (userId !== this.SUPPLIER_ID) {
              await this.answerCallbackQuery(callbackQueryId, 'У вас нет прав для этого действия');
              return false;
            }
            
            await this.answerCallbackQuery(callbackQueryId, 'Уведомляем администратора об готовности к оплате...');

            // Здесь должен быть вызов API для обновления статуса и уведомления админа
            // Пока что просто логируем
            console.log(`✅ Purchase #${purchaseIdNum} marked as ready for payment by supplier`);
            
            // Вызываем API для обновления статуса
            await this.callPurchaseStatusAPI(purchaseIdNum, 'awaiting_payment');
            break;

          case 'paid':
            // Только администратор может подтвердить оплату
            if (userId !== this.ADMIN_ID) {
              await this.answerCallbackQuery(callbackQueryId, 'У вас нет прав для этого действия');
              return false;
            }
            
            await this.answerCallbackQuery(callbackQueryId, 'Подтверждаем оплату...');
            console.log(`💰 Purchase #${purchaseIdNum} marked as paid by admin`);
            
            await this.callPurchaseStatusAPI(purchaseIdNum, 'paid');
            break;

          case 'shipped':
            // Только поставщик может отметить передачу в карго
            if (userId !== this.SUPPLIER_ID) {
              await this.answerCallbackQuery(callbackQueryId, 'У вас нет прав для этого действия');
              return false;
            }
            
            await this.answerCallbackQuery(callbackQueryId, 'Отмечаем передачу в карго...');
            console.log(`📦 Purchase #${purchaseIdNum} marked as shipped by supplier`);
            
            await this.callPurchaseStatusAPI(purchaseIdNum, 'shipped');
            break;

          case 'cancel':
            // Только администратор может отменить
            if (userId !== this.ADMIN_ID) {
              await this.answerCallbackQuery(callbackQueryId, 'У вас нет прав для этого действия');
              return false;
            }
            
            await this.answerCallbackQuery(callbackQueryId, 'Отменяем закупку...');
            console.log(`❌ Purchase #${purchaseIdNum} cancelled by admin`);
            
            await this.callPurchaseStatusAPI(purchaseIdNum, 'cancelled');
            break;

          default:
            await this.answerCallbackQuery(callbackQueryId, 'Неизвестное действие');
            return false;
        }
          
          return true;
        }

      await this.answerCallbackQuery(callbackQueryId, 'Неизвестная команда');
      return false;

    } catch (error) {
      console.error('❌ Error handling callback:', error);
      await this.answerCallbackQuery(callbackQueryId, 'Произошла ошибка при обработке команды');
      return false;
    }
  }

  /**
   * Вызвать API для обновления статуса закупки
   */
  private static async callPurchaseStatusAPI(purchaseId: number, newStatus: string): Promise<void> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/purchases/${purchaseId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({ status: newStatus }),
        });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      console.log(`✅ Purchase #${purchaseId} status updated to ${newStatus}`);
    } catch (error) {
      console.error(`❌ Failed to update purchase #${purchaseId} status:`, error);
    }
  }

  /**
   * Ответить на callback query
   */
  private static async answerCallbackQuery(callbackQueryId: string, text: string): Promise<void> {
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
      console.error('❌ Error answering callback query:', error);
    }
  }

  /**
   * Получить информацию о боте (для тестирования)
   */
  static async getBotInfo(): Promise<any> {
    if (!this.BOT_TOKEN) {
      return { error: 'Bot token not configured' };
    }

    try {
      const response = await fetch(`${this.API_URL}/getMe`);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('❌ Error getting bot info:', error);
      return { error: error.message };
    }
  }
} 