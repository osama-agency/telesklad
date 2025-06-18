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
  isUrgent?: boolean;
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

    // В режиме разработки возвращаем заглушку только для поставщика, но отправляем реально в группу
    if (process.env.NODE_ENV === 'development' && message.chat_id !== this.GROUP_CHAT_ID) {
      console.log(`🔧 DEV MODE: Simulating Telegram message to ${message.chat_id}`);
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
   * 5. Уведомить группу о новой закупке
   */
  static async notifyGroupNewPurchase(purchase: Purchase): Promise<{ success: boolean; messageId?: number }> {
    console.log(`📢 Notifying group about new purchase #${purchase.id}`);

    // Рассчитываем общую сумму в лирах
    const totalPrimeCostTry = purchase.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    // Формируем список товаров с себестоимостью в лирах
    const itemsText = purchase.items
      .map(item => {
        const itemTotal = item.costPrice * item.quantity;
        return `• <b>${item.productName}</b>\n  ${item.quantity} шт. × ₺${item.costPrice.toFixed(2)} = <b>₺${itemTotal.toFixed(2)}</b>`;
      })
      .join('\n\n');

    const urgentTag = purchase.isUrgent ? '🔴 <b>СРОЧНАЯ ЗАКУПКА!</b>\n\n' : '';

    const message: TelegramMessage = {
      chat_id: this.GROUP_CHAT_ID,
      text: `📋 <b>Новая закупка #${purchase.id}</b>

<b>Товары и себестоимость:</b>
${itemsText}

💰 <b>Общая себестоимость: ₺${totalPrimeCostTry.toFixed(2)}</b>

📅 <b>Дата создания:</b> ${new Date(purchase.createdAt).toLocaleString('ru-RU', { 
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}${purchase.supplierName ? `\n🏪 <b>Поставщик:</b> ${purchase.supplierName}` : ''}${purchase.notes ? `\n📝 <b>Примечания:</b> ${purchase.notes}` : ''}

<i>Закупка отправлена поставщику для обработки.</i>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💰 Нужно оплатить',
              callback_data: `purchase_payment_needed_${purchase.id}`
            }
          ]
        ]
      }
    };

    const result = await this.sendMessage(message);
    
    if (result && result.ok) {
      console.log(`✅ Group notified about new purchase, message_id: ${result.result.message_id}`);
      return { success: true, messageId: result.result.message_id };
    }
    
    console.log('❌ Failed to notify group about new purchase');
    return { success: false };
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
        const [subAction, ...rest] = params;
        let purchaseIdNum: number;

        // Обрабатываем разные форматы callback data
        if (subAction === 'payment' && rest[0] === 'needed') {
          // Формат: purchase_payment_needed_123
          purchaseIdNum = parseInt(rest[1]);
        } else {
          // Формат: purchase_ready_123, purchase_paid_123, etc.
          purchaseIdNum = parseInt(rest[0]);
        }

        if (isNaN(purchaseIdNum)) {
          await this.answerCallbackQuery(callbackQueryId, 'Неверный ID закупки');
          return false;
        }

        // Проверяем права пользователя
        const userId = from.id.toString();
        
        switch (subAction) {
          case 'payment':
            // Обрабатываем "payment_needed" - только поставщик может отметить что нужна оплата
            if (rest[0] === 'needed') {
              if (userId !== this.SUPPLIER_ID) {
                await this.answerCallbackQuery(callbackQueryId, 'У вас нет прав для этого действия');
                return false;
              }
              
              // Проверяем количество нажатий
              const clickResult = await this.handlePaymentButtonClick(purchaseIdNum, message);
              
              if (clickResult.limitReached) {
                await this.answerCallbackQuery(callbackQueryId, 'Кнопка больше недоступна (максимум 3 нажатия)');
                return false;
              }
              
              await this.answerCallbackQuery(callbackQueryId, `Уведомляем администратора (${clickResult.clickCount}/3)...`);
              console.log(`💰 Purchase #${purchaseIdNum} payment request #${clickResult.clickCount} by supplier`);
              
              // Отправляем уведомление в группу
              await this.sendPaymentNotificationToGroup(purchaseIdNum, clickResult.clickCount);
              
              // Если достигли лимита в 3 нажатия, убираем кнопку
              if (clickResult.clickCount >= 3) {
                await this.removePaymentButton(message.chat.id, message.message_id, purchaseIdNum);
              }
            }
            break;

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
   * Обработать нажатие кнопки "Нужно оплатить"
   */
  private static async handlePaymentButtonClick(purchaseId: number, message: any): Promise<{ clickCount: number; limitReached: boolean }> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/purchases/${purchaseId}/payment-button-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`❌ Failed to handle payment button click for purchase #${purchaseId}:`, error);
      return { clickCount: 1, limitReached: false };
    }
  }

  /**
   * Отправить уведомление в группу о необходимости оплаты
   */
  private static async sendPaymentNotificationToGroup(purchaseId: number, clickCount: number): Promise<void> {
    const message: TelegramMessage = {
      chat_id: this.GROUP_CHAT_ID,
      text: `💰 <b>Требуется оплата закупки</b>

@osama_digital Нужно сделать оплату закупки #${purchaseId}

<i>Уведомление ${clickCount}/3</i>`,
      parse_mode: 'HTML'
    };

    const result = await this.sendMessage(message);
    
    if (result && result.ok) {
      console.log(`✅ Payment notification sent to group for purchase #${purchaseId}, attempt ${clickCount}`);
    } else {
      console.log(`❌ Failed to send payment notification to group for purchase #${purchaseId}`);
    }
  }

  /**
   * Убрать кнопку "Нужно оплатить" после 3 нажатий
   */
  private static async removePaymentButton(chatId: number | string, messageId: number, purchaseId: number): Promise<void> {
    try {
      // Получаем данные о закупке для обновления сообщения
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/purchases/${purchaseId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch purchase data: ${response.status}`);
      }
      
      const purchase = await response.json();
      
      // Пересоздаем сообщение без кнопки
      const totalPrimeCostTry = purchase.items.reduce((sum: number, item: any) => sum + (item.unitcosttry * item.quantity), 0);

      const itemsText = purchase.items
        .map((item: any) => {
          const itemTotal = item.unitcosttry * item.quantity;
          return `• <b>${item.productname}</b>\n  ${item.quantity} шт. × ₺${item.unitcosttry.toFixed(2)} = <b>₺${itemTotal.toFixed(2)}</b>`;
        })
        .join('\n\n');

      const newText = `📋 <b>Новая закупка #${purchase.id}</b>

<b>Товары и себестоимость:</b>
${itemsText}

💰 <b>Общая себестоимость: ₺${totalPrimeCostTry.toFixed(2)}</b>

📅 <b>Дата создания:</b> ${new Date(purchase.createdat).toLocaleString('ru-RU', { 
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}${purchase.suppliername ? `\n🏪 <b>Поставщик:</b> ${purchase.suppliername}` : ''}${purchase.notes ? `\n📝 <b>Примечания:</b> ${purchase.notes}` : ''}

<i>Закупка отправлена поставщику для обработки.</i>

⚠️ <i>Кнопка оплаты больше недоступна (достигнут лимит 3 нажатия)</i>`;

      const result = await this.editMessage(chatId, messageId, newText);
      
      if (result && result.ok) {
        console.log(`✅ Payment button removed for purchase #${purchaseId}`);
      } else {
        console.log(`❌ Failed to remove payment button for purchase #${purchaseId}`);
      }
    } catch (error) {
      console.error(`❌ Error removing payment button for purchase #${purchaseId}:`, error);
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