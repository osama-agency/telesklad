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

import { TelegramTokenService } from './telegram-token.service';

export class TelegramBotService {
  // Убираем статические константы - теперь токены получаем динамически
  private static BOT_TOKEN: string | null = null;
  private static API_URL: string | null = null;
  
  // Правильные ID из ваших данных
  private static readonly GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID || '-4729817036';

  /**
   * Инициализация токена и API URL
   */
  private static async initializeToken(): Promise<void> {
    if (!this.BOT_TOKEN || !this.API_URL) {
      this.BOT_TOKEN = await TelegramTokenService.getTelegramBotToken();
      if (this.BOT_TOKEN) {
        this.API_URL = `https://api.telegram.org/bot${this.BOT_TOKEN}`;
      }
    }
  }

  /**
   * Отправить сообщение в Telegram
   */
  private static async sendMessage(message: TelegramMessage): Promise<any> {
    // Инициализируем токен если нужно
    await this.initializeToken();
    
    if (!this.BOT_TOKEN || !this.API_URL) {
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
      
      const response = await fetch(`${this.API_URL!}/sendMessage`, {
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
    // Инициализируем токен если нужно
    await this.initializeToken();
    
    if (!this.BOT_TOKEN || !this.API_URL) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return null;
    }

    try {
      console.log(`📝 Editing message ${messageId} in chat ${chatId}`);
      
      const response = await fetch(`${this.API_URL!}/editMessageText`, {
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
      case 'sent_to_supplier': return '📤 Отправлено в Телеграм';
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
   * 1. Отправить новую закупку в группу закупщика
   */
  static async sendPurchaseToSupplier(purchase: Purchase): Promise<{ success: boolean; messageId?: number }> {
    console.log(`🚀 Sending purchase #${purchase.id} to group ${this.GROUP_CHAT_ID}`);

    // Получаем курс лиры для конвертации из рублей в лиры
    let tryRate = 30; // Курс по умолчанию, если не удастся получить актуальный
    try {
      const ExchangeRateService = (await import('@/lib/services/exchange-rate.service')).ExchangeRateService;
      const latestRate = await ExchangeRateService.getLatestRate('TRY');
      tryRate = Number(latestRate.rate); // Используем базовый курс без буфера для отображения
      console.log(`💱 Using TRY rate for display: ${tryRate} RUB per TRY`);
    } catch (error) {
      console.warn(`⚠️ Could not get TRY rate, using default: ${tryRate}`);
    }

    // Рассчитываем общую сумму в рублях (как хранится в базе)
    const totalPrimeCostRub = purchase.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    
    // Конвертируем в лиры для отображения
    const totalPrimeCostTry = totalPrimeCostRub / tryRate;

    // Формируем список товаров с ценами в лирах
    const itemsText = purchase.items
      .map(item => {
        const itemTotalRub = item.costPrice * item.quantity;
        const itemTotalTry = itemTotalRub / tryRate;
        const costPriceTry = item.costPrice / tryRate;
        return `• <b>${item.productName}</b>\n  ${item.quantity} шт. × ${costPriceTry.toFixed(2)} ₺ = <b>${itemTotalTry.toFixed(2)} ₺</b>`;
      })
      .join('\n\n');

    const urgentTag = purchase.isUrgent ? '🔴 <b>СРОЧНАЯ ЗАКУПКА!</b>\n\n' : '';

    const message: TelegramMessage = {
      chat_id: this.GROUP_CHAT_ID,
      text: `${urgentTag}📋 <b>Новая закупка #${purchase.id}</b>

<b>Товары и цены:</b>
${itemsText}

💰 <b>Общая сумма: ${totalPrimeCostTry.toFixed(2)} ₺</b>

📅 <b>Дата создания:</b> ${new Date(purchase.createdAt).toLocaleString('ru-RU', { 
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}${purchase.supplierName ? `\n🏪 <b>Поставщик:</b> ${purchase.supplierName}` : ''}${purchase.notes ? `\n📝 <b>Примечания:</b> ${purchase.notes}` : ''}

<i>Закупка отправлена в группу для обработки</i>`,
      parse_mode: 'HTML'
    };

    const result = await this.sendMessage(message);
    
    if (result && result.ok) {
      console.log(`✅ Purchase sent to group, message_id: ${result.result.message_id}`);
      return { success: true, messageId: result.result.message_id };
    }
    
    console.log('❌ Failed to send purchase to group');
    return { success: false };
  }

  /**
   * Закрепить сообщение в чате
   */
  private static async pinMessage(chatId: number | string, messageId: number): Promise<any> {
    // Инициализируем токен если нужно
    await this.initializeToken();
    
    if (!this.BOT_TOKEN || !this.API_URL) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return null;
    }

    try {
      console.log(`📌 Pinning message ${messageId} in chat ${chatId}`);
      
      const response = await fetch(`${this.API_URL!}/pinChatMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          disable_notification: false, // Уведомить участников о закреплении
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Telegram API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Message pinned successfully');
      return result;
    } catch (error) {
      console.error('❌ Error pinning Telegram message:', error);
      return null;
    }
  }

  /**
   * Отправить простое текстовое сообщение в группу
   */
  static async sendSimpleMessage(text: string, shouldPin: boolean = false, replyMarkup?: any): Promise<{ success: boolean; messageId?: number }> {
    console.log(`📤 Sending simple message to group`);

    const message: TelegramMessage = {
      chat_id: this.GROUP_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    };

    const result = await this.sendMessage(message);
    
    if (result && result.ok) {
      const messageId = result.result.message_id;
      console.log(`✅ Simple message sent to group, message_id: ${messageId}`);
      
      // Закрепляем сообщение если нужно
      if (shouldPin) {
        console.log(`📌 Attempting to pin message ${messageId}`);
        const pinResult = await this.pinMessage(this.GROUP_CHAT_ID, messageId);
        if (pinResult && pinResult.ok) {
          console.log(`✅ Message ${messageId} pinned successfully`);
        } else {
          console.log(`⚠️ Failed to pin message ${messageId}, but message was sent`);
        }
      }
      
      return { success: true, messageId };
    }
    
    console.log('❌ Failed to send simple message to group');
    return { success: false };
  }

  /**
   * Отправить уведомление об оплате закупки с интерактивной кнопкой
   */
  static async sendPaymentNotification(purchaseId: number, purchaseData: {
    items: Array<{ productName: string; quantity: number }>;
    totalAmount: number;
    paidExchangeRate?: number;
  }): Promise<{ success: boolean; messageId?: number }> {
    console.log(`💰 Sending payment notification for purchase #${purchaseId} with interactive button`);

    // Формируем список товаров
    const itemsList = purchaseData.items
      .map((item, index) => `${index + 1}. ${item.productName} - ${item.quantity} шт.`)
      .join('\n');

    // Конвертируем сумму из рублей в лиры для отображения
    let totalInTry = purchaseData.totalAmount;
    if (purchaseData.paidExchangeRate) {
      totalInTry = purchaseData.totalAmount / purchaseData.paidExchangeRate;
    } else {
      // Если нет курса оплаты, используем текущий курс для отображения
      try {
        const ExchangeRateService = (await import('@/lib/services/exchange-rate.service')).ExchangeRateService;
        const latestRate = await ExchangeRateService.getLatestRate('TRY');
        totalInTry = purchaseData.totalAmount / Number(latestRate.rate);
      } catch (error) {
        totalInTry = purchaseData.totalAmount / 30; // Курс по умолчанию
      }
    }

    const paymentMessage = `💰 <b>Закупка #${purchaseId} - оплачена!</b>

📦 <b>Товары (${purchaseData.items.length} поз.):</b>
${itemsList}

💵 <b>Итого: ${totalInTry.toFixed(2)} ₺</b>

✅ Статус изменен на "Оплачено"`;

    // Создаем интерактивную кнопку
    const replyMarkup = {
      inline_keyboard: [[
        {
          text: "🚚 Отправлено в Карго",
          callback_data: `shipped_${purchaseId}`
        }
      ]]
    };

    return await this.sendSimpleMessage(paymentMessage, true, replyMarkup);
  }

  /**
   * Получить информацию о боте (для тестирования)
   */
  static async getBotInfo(): Promise<any> {
    // Инициализируем токен если нужно
    await this.initializeToken();
    
    if (!this.BOT_TOKEN || !this.API_URL) {
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