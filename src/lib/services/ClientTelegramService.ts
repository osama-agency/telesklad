import { SettingsService } from './SettingsService';

interface ClientTelegramServiceOptions {
  markup?: string;
  markup_url?: string;
}

/**
 * ClientTelegramService - сервис для отправки сообщений клиентам
 * В development: ВСЕГДА использует @strattera_test_bot
 * В production: использует @telesklad_bot
 */
export class ClientTelegramService {
  private static readonly MESSAGE_LIMIT = 4090;

  /**
   * Отправить сообщение клиенту через правильный бот
   * ВСЕГДА @strattera_test_bot для клиентов
   */
  static async sendToClient(message: string, userTgId: string, options: ClientTelegramServiceOptions = {}): Promise<number | Error> {
    console.log(`📤 ClientTelegramService.sendToClient:`, {
      to: userTgId,
      bot: '@strattera_test_bot (ALWAYS)',
      markup: options.markup,
      messageLength: message.length
    });

    try {
      // ✅ ИСПРАВЛЕНО: Клиенты ВСЕГДА используют @strattera_test_bot
      const token = await SettingsService.get('client_bot_token', process.env.WEBAPP_TELEGRAM_BOT_TOKEN);
      if (!token) {
        throw new Error('Client bot token not available');
      }
      
      console.log('🔑 ClientTelegramService using WEBAPP_TELEGRAM_BOT_TOKEN (@strattera_test_bot) for client');

      // ✅ УБИРАЕМ префикс Development - клиенты всегда в тестовом боте
      const finalMessage = message; // Без префикса

      // Формируем клавиатуру если нужно
      const markup = this.formMarkup(options);
      
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userTgId,
          text: this.escape(finalMessage),
          parse_mode: 'MarkdownV2',
          reply_markup: markup
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Telegram API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      const messageId = result.result.message_id;
      console.log(`✅ Client message sent to ${userTgId}, ID: ${messageId}`);
      
      return messageId;
      
    } catch (error) {
      console.error(`❌ Failed to send client message: ${error}`);
      return error instanceof Error ? error : new Error('Unknown error');
    }
  }

  private static escape(text: string): string {
    // Удаляем ANSI escape коды и экранируем специальные символы для MarkdownV2
    return text
      .replace(/\[[0-9;]*m/g, '') // удаляем ANSI коды
      .replace(/([-_\[\]()~>#+=|{}.!])/g, '\\$1'); // экранируем спецсимволы
  }

  private static formMarkup(options: ClientTelegramServiceOptions): any {
    if (!options.markup && !options.markup_url) {
      return undefined;
    }

    const buttons: any[][] = [];
    
    if (options.markup) {
      buttons.push([{
        text: this.getButtonText(options.markup),
        callback_data: options.markup
      }]);
      
      if (options.markup === 'i_paid') {
        buttons.push([{
          text: 'Изменить заказ',
          url: `https://t.me/strattera_bot?startapp`
        }]);
        buttons.push([{
          text: 'Задать вопрос',
          url: 'https://t.me/your_support'
        }]);
      }
    }
    
    if (options.markup_url) {
      buttons.push([{
        text: 'Отследить посылку',
        url: options.markup_url
      }]);
    }
    
    return buttons.length > 0 ? { inline_keyboard: buttons } : undefined;
  }

  private static getButtonText(markup: string): string {
    const buttonTexts: { [key: string]: string } = {
      'i_paid': 'Я оплатил',
      'approve_payment': 'Оплата пришла',
      'submit_tracking': 'Привязать трек-номер',
      'resend_tracking': 'Переотправить трек-номер',
      'track_package': 'Отследить посылку',
      'new_order': 'Новый заказ',
      'mailing': 'Рассылка'
    };
    
    return buttonTexts[markup] || markup;
  }
} 