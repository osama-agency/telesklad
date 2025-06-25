import { TelegramTokenService } from './telegram-token.service';

interface AdminTelegramServiceOptions {
  markup?: string;
  markup_url?: string;
  markup_text?: string;
  markup_ext_url?: string;
}

/**
 * AdminTelegramService - сервис для отправки сообщений админу
 * ВСЕГДА использует @telesklad_bot для админских уведомлений
 */
export class AdminTelegramService {
  private static readonly ADMIN_CHAT_ID = '125861752'; // ID Эльдара
  private static readonly MESSAGE_LIMIT = 4090;

  /**
   * Отправить сообщение админу через @telesklad_bot
   */
  static async sendToAdmin(message: string, options: AdminTelegramServiceOptions = {}): Promise<number | Error> {
    // Удалено логирование для безопасности в продакшене

    try {
      // Админские уведомления ВСЕГДА идут в @telesklad_bot
      const botToken = await TelegramTokenService.getTelegramBotToken();
      // Удалено логирование токена для безопасности

      if (!botToken) {
        throw new Error('Bot token not available');
      }

      // Добавляем префикс для разработки
      let finalMessage = message;
      if (process.env.NODE_ENV === 'development') {
        finalMessage = `‼️‼️Development‼️‼️\n\n${message}`;
      }

      // Обрезаем сообщение если слишком длинное
      if (finalMessage.length > this.MESSAGE_LIMIT) {
        finalMessage = finalMessage.substring(0, this.MESSAGE_LIMIT - 10) + '...';
      }

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const payload: any = {
        chat_id: this.ADMIN_CHAT_ID,
        text: finalMessage,
        parse_mode: 'HTML'
      };

      // Добавляем клавиатуру если указана
      if (options.markup) {
        payload.reply_markup = this.createKeyboard(options);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.ok) {
        // Удалено логирование для безопасности
        return result.result.message_id;
      } else {
        console.error('❌ Failed to send message to admin:', result);
        return new Error(`Telegram API error: ${result.description}`);
      }

    } catch (error) {
      console.error('❌ Error sending message to admin:', error);
      return error instanceof Error ? error : new Error('Unknown error');
    }
  }

  /**
   * Создание клавиатуры для сообщения
   */
  private static createKeyboard(options: AdminTelegramServiceOptions): any {
    const keyboard: any[][] = [];

    // Основная кнопка действия
    if (options.markup) {
      switch (options.markup) {
        case 'approve_payment':
          keyboard.push([{
            text: 'Оплата пришла',
            callback_data: 'approve_payment'
          }]);
          break;
        case 'submit_tracking':
          keyboard.push([{
            text: 'Отправить трек-номер',
            callback_data: 'submit_tracking'
          }]);
          break;
        default:
          keyboard.push([{
            text: options.markup_text || 'Кнопка',
            callback_data: options.markup
          }]);
      }
    }

    // Дополнительные кнопки
    if (options.markup_url) {
      keyboard.push([{
        text: options.markup_text || 'Ссылка',
        url: options.markup_url
      }]);
    }

    if (options.markup_ext_url) {
      keyboard.push([{
        text: 'Внешняя ссылка',
        url: options.markup_ext_url
      }]);
    }

    return {
      inline_keyboard: keyboard
    };
  }

  /**
   * Экранирование текста для MarkdownV2
   */
  private static escapeMarkdownV2(text: string): string {
    // Список символов, которые нужно экранировать в MarkdownV2
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    
    let escaped = text;
    for (const char of specialChars) {
      escaped = escaped.replace(new RegExp('\\' + char, 'g'), '\\' + char);
    }
    
    return escaped;
  }
} 