import { ExchangeRateService } from './exchange-rate.service';

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

/**
 * TelegramBotService - упрощенный сервис для отправки закупок в группу
 * Использует отдельного бота для закупок
 */
export class TelegramBotService {
  // БОТ ДЛЯ ЗАКУПОК - используем переменную окружения
  private static readonly PURCHASE_BOT_TOKEN = process.env.TELEGRAM_PURCHASE_BOT_TOKEN || '7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4';
  private static readonly PURCHASE_API_URL = `https://api.telegram.org/bot${this.PURCHASE_BOT_TOKEN}`;
  
  // ID группы для закупок
  private static readonly GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID || '-4729817036';

  /**
   * Отправить сообщение через бота для закупок
   */
  private static async sendMessage(message: TelegramMessage): Promise<any> {
    if (!this.PURCHASE_BOT_TOKEN) {
      console.error('❌ PURCHASE_BOT_TOKEN not configured');
      return null;
    }

    // В режиме разработки возвращаем заглушку только для поставщика
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
      console.log(`📤 [PURCHASE BOT] Sending to ${message.chat_id}:`, message.text.substring(0, 100) + '...');
      
      const response = await fetch(`${this.PURCHASE_API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Purchase Bot API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [PURCHASE BOT] Message sent successfully, message_id:', result.result?.message_id);
      return result;
    } catch (error) {
      console.error('❌ [PURCHASE BOT] Error sending message:', error);
      return null;
    }
  }

  /**
   * Закрепить сообщение в чате
   */
  private static async pinMessage(chatId: number | string, messageId: number): Promise<any> {
    try {
      console.log(`📌 [PURCHASE BOT] Pinning message ${messageId} in chat ${chatId}`);
      
      const response = await fetch(`${this.PURCHASE_API_URL}/pinChatMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          disable_notification: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Purchase Bot API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ [PURCHASE BOT] Message pinned successfully');
      return result;
    } catch (error) {
      console.error('❌ [PURCHASE BOT] Error pinning message:', error);
      return null;
    }
  }

  /**
   * Отправить новую закупку в группу закупщика
   */
  static async sendPurchaseToSupplier(purchase: Purchase): Promise<{ success: boolean; messageId?: number }> {
    console.log(`🚀 [PURCHASE BOT] Sending purchase #${purchase.id} to group ${this.GROUP_CHAT_ID}`);

    // Получаем курс лиры для конвертации
    let tryRate = 30; // Курс по умолчанию
    try {
      const latestRate = await ExchangeRateService.getLatestRate('TRY');
      tryRate = Number(latestRate.rate);
      console.log(`💱 Using TRY rate for display: ${tryRate} RUB per TRY`);
    } catch (error) {
      console.warn(`⚠️ Could not get TRY rate, using default: ${tryRate}`);
    }

    // Рассчитываем общую сумму в рублях
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
      console.log(`✅ [PURCHASE BOT] Purchase sent to group, message_id: ${result.result.message_id}`);
      return { success: true, messageId: result.result.message_id };
    }
    
    console.log('❌ [PURCHASE BOT] Failed to send purchase to group');
    return { success: false };
  }

  /**
   * Отправить простое текстовое сообщение в группу
   */
  static async sendSimpleMessage(text: string, shouldPin: boolean = false, replyMarkup?: any): Promise<{ success: boolean; messageId?: number }> {
    console.log(`📤 [PURCHASE BOT] Sending simple message to group`);

    const message: TelegramMessage = {
      chat_id: this.GROUP_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    };

    const result = await this.sendMessage(message);
    
    if (result && result.ok) {
      const messageId = result.result.message_id;
      console.log(`✅ [PURCHASE BOT] Simple message sent to group, message_id: ${messageId}`);
      
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
    
    console.log('❌ [PURCHASE BOT] Failed to send simple message to group');
    return { success: false };
  }

  /**
   * Отправить уведомление об оплате закупки
   */
  static async sendPaymentNotification(purchaseId: number, purchaseData: {
    items: Array<{ productName: string; quantity: number }>;
    totalAmount: number;
    paidExchangeRate?: number;
  }): Promise<{ success: boolean; messageId?: number }> {
    console.log(`💰 [PURCHASE BOT] Sending payment notification for purchase #${purchaseId}`);

    // Формируем список товаров
    const itemsList = purchaseData.items
      .map((item, index) => `${index + 1}. ${item.productName} - ${item.quantity} шт.`)
      .join('\n');

    // Конвертируем сумму из рублей в лиры
    let totalInTry = purchaseData.totalAmount;
    if (purchaseData.paidExchangeRate) {
      totalInTry = purchaseData.totalAmount / purchaseData.paidExchangeRate;
    } else {
      try {
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
    try {
      const response = await fetch(`${this.PURCHASE_API_URL}/getMe`);
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('❌ [PURCHASE BOT] Error getting bot info:', error);
      return { error: error.message };
    }
  }
}