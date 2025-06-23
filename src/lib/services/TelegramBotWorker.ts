import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '@/libs/prismaDb';
import { TelegramTokenService } from './telegram-token.service';
import { TelegramService } from './TelegramService';
import { ReportService } from './report.service';

interface BotSettings {
  tg_token?: string;
  tg_main_bot?: string;
  admin_chat_id?: string;
  courier_tg_id?: string;
  admin_ids?: string;
  test_id?: string;
  preview_msg?: string;
  first_video_id?: string;
  bot_btn_title?: string;
  group_btn_title?: string;
  tg_group?: string;
  tg_support?: string;
}

/**
 * TelegramBotWorker - главный обработчик бота (аналог Rails TelegramBotWorker)
 * Обрабатывает webhook'и от Telegram и управляет состояниями пользователей
 */
export class TelegramBotWorker {
  private bot: TelegramBot | null = null;
  private settings: BotSettings = {};
  private static instance: TelegramBotWorker | null = null;
  
  // Кэш состояний пользователей (аналог Rails.cache)
  private userStates: Map<string, any> = new Map();
  private TRACK_CACHE_PERIOD = 5 * 60 * 1000; // 5 минут

  private constructor() {}

  static getInstance(): TelegramBotWorker {
    if (!this.instance) {
      this.instance = new TelegramBotWorker();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Используем настройки из переменных окружения
      this.settings = {
        tg_token: process.env.TELEGRAM_BOT_TOKEN,
        tg_main_bot: process.env.TELEGRAM_BOT_USERNAME || '@strattera_bot',
        admin_chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID || '125861752',
        courier_tg_id: process.env.TELEGRAM_COURIER_ID || '821810448',
        admin_ids: process.env.TELEGRAM_ADMIN_IDS || '125861752',
        test_id: process.env.TELEGRAM_TEST_ID,
        preview_msg: process.env.TELEGRAM_PREVIEW_MSG,
        first_video_id: process.env.TELEGRAM_FIRST_VIDEO_ID,
        bot_btn_title: process.env.TELEGRAM_BOT_BTN_TITLE || 'Открыть приложение',
        group_btn_title: process.env.TELEGRAM_GROUP_BTN_TITLE || 'Присоединиться к группе',
        tg_group: process.env.TELEGRAM_GROUP_URL || 'https://t.me/joinchat/your_group',
        tg_support: process.env.TELEGRAM_SUPPORT_URL || 'https://t.me/your_support'
      };
      
      console.log('📌 Bot settings loaded from environment variables');
      
      // Получаем токен бота
      const token = await TelegramTokenService.getTelegramBotToken();
      if (!token) {
        console.error('❌ tg_token not specified!');
        throw new Error('Telegram bot token not configured');
      }

      // Инициализируем бота БЕЗ polling (только webhook)
      this.bot = new TelegramBot(token, { polling: false });
      
      console.log('✅ TelegramBotWorker initialized in webhook mode');
    } catch (error) {
      console.error('❌ Failed to initialize TelegramBotWorker:', error);
      throw error;
    }
  }

  /**
   * Обработка webhook update от Telegram
   */
  async processWebhookUpdate(update: any): Promise<void> {
    if (!this.bot) {
      await this.initialize();
    }

    try {
      // Обрабатываем разные типы обновлений
      if (update.callback_query) {
        await this.handleCallback(update.callback_query);
      } else if (update.message) {
        await this.handleMessage(update.message);
      }
    } catch (error) {
      console.error('❌ Error processing webhook update:', error);
      this.processError(error);
    }
  }

  /**
   * Настройка webhook URL в Telegram
   */
  async setupWebhook(webhookUrl: string, secretToken?: string): Promise<boolean> {
    if (!this.bot) {
      await this.initialize();
    }

    try {
      const options: any = {
        allowed_updates: ['message', 'callback_query'],
      };

      if (secretToken) {
        options.secret_token = secretToken;
      }

      const result = await this.bot!.setWebHook(webhookUrl, options);
      
      if (result) {
        console.log(`✅ Webhook set successfully: ${webhookUrl}`);
        
        // Получаем информацию о webhook
        const webhookInfo = await this.bot!.getWebHookInfo();
        console.log('📌 Webhook info:', webhookInfo);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to setup webhook:', error);
      return false;
    }
  }

  /**
   * Удаление webhook (для локальной разработки)
   */
  async deleteWebhook(): Promise<boolean> {
    if (!this.bot) {
      await this.initialize();
    }

    try {
      const result = await this.bot!.deleteWebHook();
      console.log('✅ Webhook deleted successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to delete webhook:', error);
      return false;
    }
  }

  /**
   * Получение информации о текущем webhook
   */
  async getWebhookInfo(): Promise<any> {
    if (!this.bot) {
      await this.initialize();
    }

    try {
      return await this.bot!.getWebHookInfo();
    } catch (error) {
      console.error('❌ Failed to get webhook info:', error);
      return null;
    }
  }

  private async loadSettings(): Promise<void> {
    const settings = await prisma.settings.findMany();
    this.settings = settings.reduce((acc, setting) => {
      if (setting.variable && setting.value) {
        acc[setting.variable as keyof BotSettings] = setting.value;
      }
      return acc;
    }, {} as BotSettings);
  }

  private async handleCallback(callbackQuery: TelegramBot.CallbackQuery): Promise<void> {
    if (!this.bot) return;

    const data = callbackQuery.data;
    const message = callbackQuery.message;
    
    if (!data || !message) return;

    console.log(`📲 Callback: ${data} from ${callbackQuery.from.id}`);

    // Обработка callback'ов как в Rails
    switch (data) {
      case 'i_paid':
        await this.handleIPaid(callbackQuery);
        break;
      case 'approve_payment':
        await this.handleApprovePayment(callbackQuery);
        break;
      case 'submit_tracking':
        await this.handleSubmitTracking(callbackQuery);
        break;
      default:
        // Обработка динамических callback'ов
        if (data.startsWith('order_')) {
          await this.handleOrderCallback(callbackQuery);
        }
    }
  }

  private async handleMessage(msg: TelegramBot.Message): Promise<void> {
    if (!this.bot) return;

    const chatId = msg.chat.id;
    
    // Проверка на сообщение от курьера с трек-номером
    if (chatId.toString() === this.settings.courier_tg_id) {
      await this.inputTrackingNumber(msg);
      return;
    }

    // Обработка обычных сообщений
    if (msg.text) {
      await this.processMessage(msg);
      
      // Отправляем приветственное сообщение если это не команда /start
      if (msg.text !== '/start') {
        await this.sendFirstMsg(chatId);
      }
    } else if (msg.video) {
      await this.savePreviewVideo(msg);
    } else if (msg.photo) {
      await this.savePhoto(msg);
    } else {
      await this.otherMessage(msg);
    }
  }

  private async processMessage(msg: TelegramBot.Message): Promise<void> {
    const tgUser = msg.chat;
    
    // Поиск или создание пользователя
    const user = await this.findOrCreateUser(tgUser, true);
    
    if (user && !user.started) {
      await this.unlockUser(user);
    }

    // Сохраняем сообщение если это не /start
    if (msg.text !== '/start' && user && msg.message_id) {
      try {
        await prisma.messages.create({
          data: {
            tg_id: BigInt(user.tg_id),
            text: msg.text,
            tg_msg_id: BigInt(msg.message_id),
            is_incoming: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  }

  private async findOrCreateUser(tgChat: any, createIfNotExists: boolean): Promise<any> {
    const tgId = tgChat.id.toString();
    
    let user = await prisma.users.findUnique({
      where: { tg_id: BigInt(tgId) }
    });

    if (!user && createIfNotExists) {
      user = await prisma.users.create({
        data: {
          tg_id: BigInt(tgId),
          email: `telegram_${tgId}@telegram.com`, // Required field
          first_name_raw: tgChat.first_name || '',
          last_name_raw: tgChat.last_name || '',
          username: tgChat.username || null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    return user;
  }

  private async unlockUser(user: any): Promise<void> {
    const msg = `User ${user.id} started bot`;
    console.log(`🔓 ${msg}`);
    
    // Уведомляем админа
    if (this.settings.test_id) {
      await TelegramService.call(msg, this.settings.test_id);
    }
    
    // Обновляем статус пользователя
    await prisma.users.update({
      where: { id: user.id },
      data: {
        started: true,
        is_blocked: false,
        updated_at: new Date()
      }
    });
  }

  private async inputTrackingNumber(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id.toString();
    const userState = this.userStates.get(`user_${chatId}_state`);
    
    if (!userState?.order_id || !msg.text) return;

    try {
      // Получаем текущий заказ
      const currentOrder = await prisma.orders.findUnique({
        where: { id: userState.order_id },
        select: { status: true }
      });

      if (!currentOrder) return;

      const previousStatus = currentOrder.status;

      // Обновляем заказ с трек-номером
      const updatedOrder = await prisma.orders.update({
        where: { id: userState.order_id },
        data: {
          tracking_number: msg.text,
          status: 3, // shipped (в Rails это 3, не 2)
          shipped_at: new Date(),
          updated_at: new Date()
        },
        include: {
          order_items: {
            include: {
              products: true
            }
          },
          users: true
        }
      });

      // Отправляем уведомления через ReportService
      if (previousStatus !== updatedOrder.status) {
        // Преобразуем msg_id в bigint если оно есть
        const orderForReport = {
          ...updatedOrder,
          msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
        };
        await ReportService.handleOrderStatusChange(orderForReport as any, previousStatus);
      }

      // Удаляем старые сообщения
      if (this.bot && userState.msg_id && userState.h_msg && msg.message_id) {
        const msgIds = [userState.msg_id, userState.h_msg, msg.message_id];
        
        for (let i = 0; i < msgIds.length; i++) {
          setTimeout(async () => {
            try {
              await this.bot!.deleteMessage(chatId, msgIds[i]);
            } catch (error) {
              console.error(`Failed to delete message ${msgIds[i]}:`, error);
            }
          }, (i + 1) * 1000);
        }
      }

      // Очищаем состояние
      this.userStates.delete(`user_${chatId}_state`);
      
    } catch (error) {
      console.error('Error saving tracking number:', error);
    }
  }

  private async handleIPaid(query: TelegramBot.CallbackQuery): Promise<void> {
    if (!query.from || !query.message) return;

    try {
      const user = await prisma.users.findUnique({
        where: { tg_id: BigInt(query.from.id) }
      });

      if (!user) return;

      // Парсим номер заказа из сообщения
      const orderNumber = this.parseOrderNumber(query.message.text || '');
      if (!orderNumber) return;

      // Получаем текущий заказ
      const currentOrder = await prisma.orders.findUnique({
        where: { id: BigInt(orderNumber) },
        select: { status: true }
      });

      if (!currentOrder) return;

      const previousStatus = currentOrder.status;

      // Обновляем статус заказа
      const updatedOrder = await prisma.orders.update({
        where: { id: BigInt(orderNumber) },
        data: {
          status: 1, // paid
          updated_at: new Date()
        },
        include: {
          order_items: {
            include: {
              products: true
            }
          },
          users: true,
          bank_cards: true
        }
      });

      // Отправляем уведомления через ReportService
      if (previousStatus !== updatedOrder.status) {
        // Преобразуем msg_id в bigint если оно есть
        const orderForReport = {
          ...updatedOrder,
          msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
        };
        await ReportService.handleOrderStatusChange(orderForReport as any, previousStatus);
      }

      // Отвечаем на callback
      if (this.bot) {
        await this.bot.answerCallbackQuery(query.id, { text: 'Спасибо! Ожидайте подтверждения оплаты.' });
      }

    } catch (error) {
      console.error('Error handling i_paid:', error);
    }
  }

  private async handleApprovePayment(query: TelegramBot.CallbackQuery): Promise<void> {
    if (!query.message || !this.bot) return;

    try {
      const orderNumber = this.parseOrderNumber(query.message.text || '');
      if (!orderNumber) return;

      // Получаем текущий заказ
      const currentOrder = await prisma.orders.findUnique({
        where: { id: BigInt(orderNumber) },
        select: { status: true }
      });

      if (!currentOrder) return;

      const previousStatus = currentOrder.status;

      // Обновляем статус заказа
      const updatedOrder = await prisma.orders.update({
        where: { id: BigInt(orderNumber) },
        data: {
          status: 2, // processing
          paid_at: new Date(),
          updated_at: new Date()
        },
        include: {
          order_items: {
            include: {
              products: true
            }
          },
          users: true
        }
      });

      // Отправляем уведомления через ReportService
      if (previousStatus !== updatedOrder.status) {
        // Преобразуем msg_id в bigint если оно есть
        const orderForReport = {
          ...updatedOrder,
          msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
        };
        await ReportService.handleOrderStatusChange(orderForReport as any, previousStatus);
      }

      // Удаляем сообщение
      await this.bot.deleteMessage(query.message.chat.id, query.message.message_id);

      // Отвечаем на callback
      await this.bot.answerCallbackQuery(query.id, { text: 'Оплата подтверждена!' });

    } catch (error) {
      console.error('Error handling approve_payment:', error);
    }
  }

  private async handleSubmitTracking(query: TelegramBot.CallbackQuery): Promise<void> {
    if (!query.message || !this.bot) return;

    try {
      const text = query.message.text || '';
      const orderNumber = this.parseOrderNumber(text);
      const fullName = this.parseFullName(text);
      
      if (!orderNumber) return;

      // Отправляем сообщение с запросом трек-номера
      const msg = await this.bot.sendMessage(
        query.message.chat.id,
        `📦 Введите трек-номер для заказа №${orderNumber}\n👤 ФИО: ${fullName || 'Не указано'}`
      );

      // Сохраняем состояние
      this.saveCache(orderNumber, query.message.message_id, msg.message_id, query.message.chat.id);

      // Отвечаем на callback
      await this.bot.answerCallbackQuery(query.id, { text: 'Введите трек-номер в чат' });

    } catch (error) {
      console.error('Error handling submit_tracking:', error);
    }
  }

  private async handleOrderCallback(query: TelegramBot.CallbackQuery): Promise<void> {
    const data = query.data;
    if (!data) return;

    const [prefix, action, orderIdStr] = data.split('_');
    const orderId = parseInt(orderIdStr);

    if (isNaN(orderId)) return;

    switch (action) {
      case 'paid':
        // Клиент нажал "Я оплатил"
        await this.handleIPaid(query);
        break;
      case 'approve':
        // Админ подтвердил оплату
        await this.handleApprovePayment(query);
        break;
      // Добавьте другие обработчики по необходимости
    }
  }

  private parseOrderNumber(text: string): string | null {
    const match = text.match(/№(\d+)/);
    return match ? match[1] : null;
  }

  private parseFullName(text: string): string | null {
    const match = text.match(/ФИО:\s*(.+?)(?:\n|$)/);
    return match ? match[1].trim() : null;
  }

  private saveCache(orderId: string, msgId: number, hMsgId: number, chatId: number): void {
    const key = `user_${chatId}_state`;
    const state = {
      order_id: BigInt(orderId),
      msg_id: msgId,
      h_msg: hMsgId,
      timestamp: Date.now()
    };
    
    this.userStates.set(key, state);
    
    // Автоматически удаляем через TRACK_CACHE_PERIOD
    setTimeout(() => {
      this.userStates.delete(key);
    }, this.TRACK_CACHE_PERIOD);
  }

  private async sendFirstMsg(chatId: number): Promise<void> {
    if (!this.bot) return;

    try {
      const firstBtn = this.initializeFirstBtn();
      const markup: TelegramBot.InlineKeyboardMarkup = {
        inline_keyboard: firstBtn
      };
      
      const caption = (this.settings.preview_msg || 'Добро пожаловать!').replace(/\\n/g, '\n');
      
      if (this.settings.first_video_id) {
        await this.bot.sendVideo(chatId, this.settings.first_video_id, {
          caption,
          reply_markup: markup
        });
      } else {
        await this.bot.sendMessage(chatId, caption, {
          reply_markup: markup
        });
      }
    } catch (error) {
      console.error('Error sending first message:', error);
    }
  }

  private initializeFirstBtn(): TelegramBot.InlineKeyboardButton[][] {
    const mainBotUsername = this.settings.tg_main_bot || 'your_bot';
    
    return [
      [{
        text: this.settings.bot_btn_title || 'Новый заказ',
        url: `https://t.me/${mainBotUsername}?startapp`
      }],
      [{
        text: this.settings.group_btn_title || 'Наша группа',
        url: this.settings.tg_group || 'https://t.me/your_group'
      }],
      [{
        text: 'Задать вопрос',
        url: this.settings.tg_support || 'https://t.me/support'
      }]
    ];
  }

  private async savePreviewVideo(msg: TelegramBot.Message): Promise<void> {
    if (!msg.video || !this.bot) return;

    const adminIds = this.settings.admin_ids?.split(',') || [];
    
    if (adminIds.includes(msg.chat.id.toString())) {
      await this.bot.sendMessage(msg.chat.id, `ID видео:\n${msg.video.file_id}`);
    }
  }

  private async savePhoto(msg: TelegramBot.Message): Promise<void> {
    if (!msg.photo || msg.photo.length === 0) return;

    const tgId = msg.chat.id;
    const fileId = msg.photo[msg.photo.length - 1].file_id; // Берем самое большое фото
    const msgId = msg.message_id;
    
    // В продакшене здесь должна быть логика сохранения файла
    console.log(`📸 Photo received from ${tgId}: ${fileId}`);
    
    // TODO: Implement file download and save logic
  }

  private async otherMessage(msg: TelegramBot.Message): Promise<void> {
    const message = `Неизв. тип сообщения от ${msg.chat.id}`;
    console.warn(`⚠️ ${message}`);
    
    // Уведомляем админа
    if (this.settings.test_id) {
      await TelegramService.call(message, this.settings.test_id);
    }
    
    await this.sendFirstMsg(msg.chat.id);
  }

  private processError(error: any): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ TelegramBotWorker error: ${errorMessage}`);
    
    // В продакшене здесь должна быть отправка email об ошибке
    // EmailService.sendError(errorMessage, error.stack);
  }
}