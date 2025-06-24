import { TelegramTokenService } from './telegram-token.service';
import { prisma } from '@/libs/prismaDb';

interface TelegramServiceOptions {
  markup?: string;
  markup_url?: string;
  markup_text?: string;
  markup_ext_url?: string;
}

interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

/**
 * TelegramService - точная копия Rails TelegramService
 * Отправляет сообщения через Telegram API с поддержкой MarkdownV2
 */
export class TelegramService {
  private static readonly MESSAGE_LIMIT = 4090;
  
  private bot_token: string | null = null;
  private chat_id: string;
  private message: string;
  private message_id: number | null = null;
  private markup?: string;
  private markup_url?: string;
  private markup_text: string;
  private markup_ext_url?: string;
  private settings: any = {};

  constructor(message: string, id: string | number | null = null, options: TelegramServiceOptions = {}) {
    this.message = message;
    this.markup = options.markup;
    this.markup_url = options.markup_url;
    this.markup_text = options.markup_text || 'Кнопка';
    this.markup_ext_url = options.markup_ext_url;
    
    // Определяем chat_id
    if (id === 'courier') {
      this.chat_id = process.env.TELEGRAM_COURIER_ID || '821810448';
    } else if (id) {
      this.chat_id = id.toString();
    } else {
      this.chat_id = process.env.TELEGRAM_ADMIN_CHAT_ID || '125861752';
    }

    // Загружаем настройки из переменных окружения
    this.settings = {
      tg_main_bot: process.env.TELEGRAM_BOT_USERNAME || '@strattera_bot',
      tg_support: process.env.TELEGRAM_SUPPORT_URL || 'https://t.me/your_support',
      bot_btn_title: process.env.TELEGRAM_BOT_BTN_TITLE || 'Открыть приложение',
      group_btn_title: process.env.TELEGRAM_GROUP_BTN_TITLE || 'Присоединиться к группе'
    };
  }

  /**
   * Статический метод для быстрой отправки сообщения
   */
  static async call(message: string, id: string | number | null = null, options: TelegramServiceOptions = {}): Promise<number | Error> {
    console.log(`📤 TelegramService.call:`, {
      to: id || 'admin',
      markup: options.markup,
      messageLength: message.length
    });
    const service = new TelegramService(message, id, options);
    return await service.report();
  }

  async report(): Promise<number | Error> {
    if (await this.botReady()) {
      return await this.tgSend();
    }
    return new Error('Bot not ready');
  }

  private async loadSettings(): Promise<void> {
    try {
      const settings = await prisma.settings.findMany();
      this.settings = settings.reduce((acc, setting) => {
        if (setting.variable && setting.value) {
          acc[setting.variable] = setting.value;
        }
        return acc;
      }, {} as any);
    } catch (error) {
      console.warn('⚠️ Failed to load settings from database:', error);
      this.settings = {};
    }
  }

  private async botReady(): Promise<boolean> {
    // Определяем, кому отправляется сообщение
    const isAdminOrCourier = this.chat_id === '125861752' || // админ
                            this.chat_id === process.env.TELEGRAM_COURIER_ID || // курьер
                            this.chat_id === '7690550402'; // курьер (хардкод для надежности)
    
    if (isAdminOrCourier) {
      // Админу и курьеру ВСЕГДА отправляем через @telesklad_bot
      this.bot_token = await TelegramTokenService.getTelegramBotToken();
      console.log('🔑 Using TELESKLAD_BOT_TOKEN (@telesklad_bot) for admin/courier');
    } else if (process.env.NODE_ENV === 'development') {
      // Клиентам в development отправляем через @strattera_test_bot
      this.bot_token = await TelegramTokenService.getWebappBotToken();
      console.log('🔑 Using WEBAPP_TELEGRAM_BOT_TOKEN (@strattera_test_bot) for client in development');
    } else {
      // В production всем отправляем через @telesklad_bot
      this.bot_token = await TelegramTokenService.getTelegramBotToken();
      console.log('🔑 Using TELESKLAD_BOT_TOKEN (@telesklad_bot) for production');
    }
    
    if (this.bot_token && this.chat_id && this.message) {
      // Добавляем префикс для разработки как в Rails
      if (process.env.NODE_ENV === 'development') {
        this.message = `‼️‼️Development‼️‼️\n\n${this.message}`;
      }
      return true;
    } else {
      console.error('❌ Telegram chat ID or bot token not set!');
      return false;
    }
  }

  private escape(text: string): string {
    // Удаляем ANSI escape коды и экранируем специальные символы для MarkdownV2
    return text
      .replace(/\[[0-9;]*m/g, '') // удаляем ANSI коды
      .replace(/([-_\[\]()~>#+=|{}.!])/g, '\\$1'); // экранируем спецсимволы
  }

  private async tgSend(): Promise<number | Error> {
    const messageCount = Math.ceil(this.message.length / TelegramService.MESSAGE_LIMIT);
    const markup = this.formMarkup();
    
    for (let i = 0; i < messageCount; i++) {
      const textPart = this.nextTextPart();
      const result = await this.sendTelegramMessage(textPart, markup);
      if (result instanceof Error) {
        return result;
      }
    }
    
    return this.message_id || 0;
  }

  private async sendTelegramMessage(textPart: string, markup: any): Promise<number | Error> {
    const chatIds = this.chat_id.split(',');
    
    for (const userId of chatIds) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${this.bot_token}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: userId.trim(),
            text: this.escape(textPart),
            parse_mode: 'MarkdownV2',
            reply_markup: markup
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Telegram API error: ${response.status} - ${errorData}`);
        }

        const result = await response.json();
        this.message_id = result.result.message_id;
        console.log(`✅ Message sent to ${userId}, ID: ${this.message_id}`);
        
      } catch (error) {
        console.error(`❌ Failed to send message to bot: ${error}`);
        return error instanceof Error ? error : new Error('Unknown error');
      }
    }
    
    return this.message_id || 0;
  }

  private formKeyboard(): InlineKeyboardButton[][] {
    const buttons: InlineKeyboardButton[][] = [];
    
    if (this.markup !== 'new_order' && this.markup !== 'mailing' && this.markup !== 'track_package') {
      if (this.markup) {
        buttons.push([{
          text: this.getButtonText(this.markup),
          callback_data: this.markup
        }]);
      }
      
      if (this.markup === 'i_paid') {
        buttons.push(this.orderBtn('Изменить заказ'));
        buttons.push(this.askBtn());
      }
    } else if (this.markup === 'track_package') {
      // Кнопка "Отследить посылку" с URL для отслеживания
      if (this.markup_url) {
        buttons.push([{
          text: 'Отследить посылку',
          url: this.markup_url
        }]);
      }
      buttons.push(this.orderBtn('Новый заказ'));
    } else {
      const textBtn = this.markup === 'mailing' 
        ? (this.settings.bot_btn_title || 'Новый заказ') 
        : 'Новый заказ';
      buttons.push(this.orderBtn(textBtn));
      buttons.push(this.askBtn());
    }
    
    return buttons;
  }

  private formUrlKeyboard(): InlineKeyboardButton[][] {
    const url = this.markup_ext_url || 
      `https://t.me/${this.settings.tg_main_bot}?startapp=url=${this.markup_url}`;
    
    return [[{
      text: this.markup_text,
      url: url
    }]];
  }

  private orderBtn(btnText: string): InlineKeyboardButton[] {
    const url = `https://t.me/${this.settings.tg_main_bot}?startapp`;
    return [{
      text: btnText,
      url: url
    }];
  }

  private askBtn(): InlineKeyboardButton[] {
    return [{
      text: 'Задать вопрос',
      url: this.settings.tg_support || ''
    }];
  }

  private formMarkup(): any {
    if (!this.markup && !this.markup_url && !this.markup_ext_url) {
      return undefined;
    }

    const keyboard = this.markup ? this.formKeyboard() : this.formUrlKeyboard();
    
    return {
      inline_keyboard: keyboard
    };
  }

  private nextTextPart(): string {
    const part = this.message.substring(0, TelegramService.MESSAGE_LIMIT);
    this.message = this.message.substring(TelegramService.MESSAGE_LIMIT) || '';
    return part;
  }

  private getButtonText(markup: string): string {
    // Маппинг кнопок точно как в старом проекте (ru.yml tg_btn)
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