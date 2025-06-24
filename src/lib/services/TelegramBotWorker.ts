import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '@/libs/prismaDb';
import { TelegramTokenService } from './telegram-token.service';
import { TelegramService } from './TelegramService';
import { ReportService } from './ReportService';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';
import { RedisQueueService } from './redis-queue.service';
import { UserService } from './UserService';

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

  private constructor() {}

  static getInstance(): TelegramBotWorker {
    if (!this.instance) {
      this.instance = new TelegramBotWorker();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Инициализируем Redis
      await RedisService.initialize();
      
      // Запускаем Redis Queue Worker если Redis доступен
      if (RedisService.isAvailable()) {
        await RedisQueueService.startWorker();
      }
      
      // Загружаем настройки из базы данных
      await this.loadSettings();
      
      // Если настройки не загрузились из БД, используем fallback из переменных окружения
      if (!this.settings.tg_main_bot) {
        this.settings = {
          ...this.settings,
          tg_main_bot: process.env.TELEGRAM_BOT_USERNAME || '@strattera_bot',
          admin_chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID || '125861752',
          courier_tg_id: process.env.TELEGRAM_COURIER_ID || '821810448',
          admin_ids: process.env.TELEGRAM_ADMIN_IDS || '125861752',
          test_id: process.env.TELEGRAM_TEST_ID,
          preview_msg: process.env.TELEGRAM_PREVIEW_MSG || 'Добро пожаловать!',
          first_video_id: process.env.TELEGRAM_FIRST_VIDEO_ID,
          bot_btn_title: process.env.TELEGRAM_BOT_BTN_TITLE || 'Каталог',
          group_btn_title: process.env.TELEGRAM_GROUP_BTN_TITLE || 'Присоединиться к группе',
          tg_group: process.env.TELEGRAM_GROUP_URL || 'https://t.me/+2rTVT8IxtFozNDY0',
          tg_support: process.env.TELEGRAM_SUPPORT_URL || 'https://t.me/strattera_help'
        };
        console.log('📌 Bot settings loaded from environment variables');
      } else {
        console.log('📋 Loaded settings:', {
          tg_main_bot: this.settings.tg_main_bot,
          bot_btn_title: this.settings.bot_btn_title,
          group_btn_title: this.settings.group_btn_title,
          has_preview_msg: !!this.settings.preview_msg,
          has_first_video_id: !!this.settings.first_video_id
        });
        console.log('📌 Bot settings loaded from database');
      }
      
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
    // Пытаемся загрузить настройки из кэша
    const cachedSettings = await CacheService.getBotSettings();
    
    if (Object.keys(cachedSettings).length > 0) {
      this.settings = cachedSettings as BotSettings;
    } else {
      // Загружаем из базы данных если кэш пуст
      const settings = await prisma.settings.findMany();
      this.settings = settings.reduce((acc, setting) => {
        if (setting.variable && setting.value) {
          acc[setting.variable as keyof BotSettings] = setting.value;
        }
        return acc;
      }, {} as BotSettings);
    }
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
    console.log(`📥 Handling message from ${chatId}: ${msg.text || 'non-text message'}`);
    
    // Инкрементируем активность пользователя в Redis
    if (RedisService.isAvailable()) {
      await RedisQueueService.addAnalyticsJob('user_activity', {
        userId: chatId.toString(),
        action: 'message',
        text: msg.text || 'non-text'
      });
      console.log(`📊 User activity logged to Redis for ${chatId}`);
    }
    
    // Проверка на сообщение от курьера с трек-номером
    if (chatId.toString() === this.settings.courier_tg_id) {
      console.log(`📦 Courier message detected from ${chatId}`);
      await this.inputTrackingNumber(msg);
      return;
    }

    // Обработка обычных сообщений
    if (msg.text) {
      console.log(`💬 Processing text message: "${msg.text}"`);
      await this.processMessage(msg);
    } else if (msg.video) {
      console.log(`🎥 Processing video message`);
      await this.savePreviewVideo(msg);
    } else if (msg.photo) {
      console.log(`📸 Processing photo message`);
      await this.savePhoto(msg);
    } else {
      console.log(`❓ Processing other message type`);
      await this.otherMessage(msg);
    }
    
    // Отправляем приветственное сообщение для всех сообщений (если это не админская команда)
    const text = msg.text?.toLowerCase();
    const adminIds = this.settings.admin_ids?.split(',').map(id => id.trim()) || ['125861752'];
    const isAdmin = adminIds.includes(chatId.toString());
    const isAdminCommand = isAdmin && (text === '/admin' || text === '/settings' || text === '/test');
    
    console.log(`🔍 Admin check: isAdmin=${isAdmin}, isAdminCommand=${isAdminCommand}, text="${text}"`);
    
    if (!isAdminCommand) {
      console.log(`✉️ Sending welcome message to ${chatId}`);
      await this.sendFirstMsg(chatId);
    } else {
      console.log(`⏭️ Skipping welcome message for admin command`);
    }
  }

  private async processMessage(msg: TelegramBot.Message): Promise<void> {
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();
    
    // Проверяем, является ли отправитель администратором
    const adminIds = this.settings.admin_ids?.split(',').map(id => id.trim()) || ['125861752'];
    const isAdmin = adminIds.includes(chatId.toString());
    
    // Обработка команды /start
    if (text === '/start') {
      await this.handleStartCommand(msg);
      return;
    }
    
    // Команды для администраторов
    if (isAdmin) {
      if (text === '/admin' || text === '/settings') {
        await this.sendAdminInfo(chatId);
        return;
      }
      
      if (text === '/test') {
        await this.sendFirstMsg(chatId);
        return;
      }
    }
    
    // Обычная обработка сообщений (логирование)
    console.log(`💬 Message from ${chatId}: ${msg.text}`);
  }

  /**
   * Обработка команды /start
   */
  private async handleStartCommand(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const tgUser = {
      id: msg.from?.id,
      first_name: msg.from?.first_name,
      last_name: msg.from?.last_name,
      username: msg.from?.username
    };

    try {
      // Регистрируем/обновляем пользователя в базе через UserService
      const user = await UserService.handleTelegramStart(tgUser);
      console.log(`🔓 User ${user.id} started bot (tg_id: ${user.tg_id})`);
      
      // Уведомляем админа о новом пользователе (если это новый)
      const timeDiff = user.updated_at.getTime() - user.created_at.getTime();
      if (timeDiff < 1000) { // Если пользователь создан только что (разница меньше секунды)
        await this.notifyAdminNewUser(user);
      }
      
    } catch (error) {
      console.error('❌ Error handling /start command:', error);
      // Продолжаем выполнение - всё равно отправляем приветствие
    }
    
    // Отправляем приветственное сообщение в любом случае
    // НЕ отправляем здесь, так как это будет сделано в handleMessage
  }

  /**
   * Уведомление админа о новом пользователе
   */
  private async notifyAdminNewUser(user: any): Promise<void> {
    if (!this.settings.test_id) return;

    const message = `🆕 Новый пользователь!\n\n` +
      `👤 ID: ${user.id}\n` +
      `📱 Telegram ID: ${user.tg_id}\n` +
      `👋 Имя: ${user.first_name_raw} ${user.last_name_raw}\n` +
      `🔗 Username: ${user.username ? '@' + user.username : 'не указан'}\n` +
      `📅 Дата регистрации: ${user.created_at.toLocaleString('ru-RU')}`;

    try {
      await TelegramService.call(message, this.settings.test_id);
    } catch (error) {
      console.error('❌ Failed to notify admin about new user:', error);
    }
  }

  private async sendAdminInfo(chatId: number): Promise<void> {
    if (!this.bot) return;

    const responseText = `⚙️ Настройки бота\n\n` +
      `🤖 Основной бот: ${this.settings.tg_main_bot || 'не указан'}\n` +
      `🔘 Кнопка каталога: ${this.settings.bot_btn_title || 'не указана'}\n` +
      `👥 Кнопка группы: ${this.settings.group_btn_title || 'не указана'}\n` +
      `🔗 Ссылка на группу: ${this.settings.tg_group || 'не указана'}\n` +
      `💬 Ссылка на поддержку: ${this.settings.tg_support || 'не указана'}\n` +
      `📹 ID приветственного видео: ${this.settings.first_video_id || 'не указан'}\n` +
      `📝 Приветственное сообщение: ${this.settings.preview_msg ? 'настроено' : 'не настроено'}\n\n` +
      `🔧 Доступные команды:\n` +
      `/admin - показать эту информацию\n` +
      `/test - протестировать приветственное сообщение\n` +
      `📹 Отправьте видео - получить file_id\n` +
      `🖼 Отправьте фото - получить file_id\n\n` +
      `💡 Для изменения настроек используйте админку`;

    await this.bot.sendMessage(chatId, responseText);
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
    const userState = await RedisService.getUserState<{
      order_id: bigint;
      msg_id?: number;
      h_msg?: number;
    }>(`user_${chatId}_state`);
    
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
      await RedisService.clearUserState(`user_${chatId}_state`);
      
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

      // Отправляем сообщение с запросом трек-номера как в старом проекте
      const msg = await this.bot.sendMessage(
        query.message.chat.id,
        `Введите трек-номер для заказа №${orderNumber}\n\n👤 ФИО:\n${fullName || 'Не указано'}\n\nв чат:`
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

  private async saveCache(orderId: string, msgId: number, hMsgId: number, chatId: number): Promise<void> {
    const key = `user_${chatId}_state`;
    const state = {
      order_id: BigInt(orderId),
      msg_id: msgId,
      h_msg: hMsgId,
      timestamp: Date.now()
    };
    
    // Сохраняем состояние пользователя в Redis с TTL 5 минут
    await RedisService.setUserState(key, state, 300);
  }

  private async sendFirstMsg(chatId: number): Promise<void> {
    if (!this.bot) return;

    try {
      const firstBtn = this.initializeFirstBtn();
      const markup: TelegramBot.InlineKeyboardMarkup = {
        inline_keyboard: firstBtn
      };
      
      const caption = (this.settings.preview_msg || 'Добро пожаловать!').replace(/\\n/g, '\n');
      
      // Пытаемся отправить видео, если есть video_id
      if (this.settings.first_video_id) {
        try {
          await this.bot.sendVideo(chatId, this.settings.first_video_id, {
            caption,
            reply_markup: markup
          });
          console.log(`✅ Welcome video sent to ${chatId}`);
          return;
        } catch (videoError) {
          console.error('❌ Failed to send video, falling back to text message:', videoError);
          // Продолжаем выполнение, чтобы отправить текстовое сообщение
        }
      }
      
      // Отправляем текстовое сообщение (если видео не настроено или не удалось отправить)
      await this.bot.sendMessage(chatId, caption, {
        reply_markup: markup
      });
      console.log(`✅ Welcome message sent to ${chatId}`);
      
    } catch (error) {
      console.error('Error sending first message:', error);
    }
  }

  private initializeFirstBtn(): TelegramBot.InlineKeyboardButton[][] {
    // Используем URL нового webapp вместо старого бота
    const webappUrl = process.env.WEBAPP_URL || 'https://strattera.ngrok.app/webapp';
    
    return [
      [{
        text: this.settings.bot_btn_title || 'Каталог',
        web_app: { url: webappUrl }
      }],
      [{
        text: this.settings.group_btn_title || 'Наша группа',
        url: this.settings.tg_group || 'https://t.me/+2rTVT8IxtFozNDY0'
      }],
      [{
        text: 'Задать вопрос',
        url: this.settings.tg_support || 'https://t.me/strattera_help'
      }]
    ];
  }

  private async savePreviewVideo(msg: TelegramBot.Message): Promise<void> {
    if (!this.bot || !msg.video) return;

    const chatId = msg.chat.id;
    const video = msg.video;
    
    // Проверяем, является ли отправитель администратором
    const adminIds = this.settings.admin_ids?.split(',').map(id => id.trim()) || ['125861752'];
    const isAdmin = adminIds.includes(chatId.toString());
    
    if (isAdmin) {
      // Отправляем file_id администратору
      const responseText = `📹 *Видео получено!*\n\n` +
        `🆔 *File ID:* \`${video.file_id}\`\n` +
        `📏 *Размер:* ${video.width}x${video.height}\n` +
        `⏱ *Длительность:* ${video.duration} сек\n` +
        `📦 *Размер файла:* ${Math.round((video.file_size || 0) / 1024)} KB\n\n` +
        `💡 *Инструкция:*\n` +
        `1. Скопируйте File ID выше\n` +
        `2. Откройте админку → Настройки\n` +
        `3. Найдите параметр \`first_video_id\`\n` +
        `4. Вставьте скопированный ID\n` +
        `5. Сохраните изменения`;

      await this.bot.sendMessage(chatId, responseText, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id
      });
      
      console.log(`📹 Video file_id sent to admin ${chatId}: ${video.file_id}`);
    } else {
      // Обычным пользователям отправляем приветственное сообщение
      await this.sendFirstMsg(chatId);
    }
  }

  private async savePhoto(msg: TelegramBot.Message): Promise<void> {
    if (!this.bot || !msg.photo) return;

    const chatId = msg.chat.id;
    const photos = msg.photo;
    
    // Проверяем, является ли отправитель администратором
    const adminIds = this.settings.admin_ids?.split(',').map(id => id.trim()) || ['125861752'];
    const isAdmin = adminIds.includes(chatId.toString());
    
    if (isAdmin) {
      // Получаем фото наилучшего качества (последнее в массиве)
      const bestPhoto = photos[photos.length - 1];
      
      // Отправляем file_id администратору
      const responseText = `🖼 *Фото получено!*\n\n` +
        `🆔 *File ID:* \`${bestPhoto.file_id}\`\n` +
        `📏 *Размер:* ${bestPhoto.width}x${bestPhoto.height}\n` +
        `📦 *Размер файла:* ${Math.round((bestPhoto.file_size || 0) / 1024)} KB\n\n` +
        `📋 *Все размеры:*\n` +
        photos.map((photo, index) => 
          `${index + 1}. ${photo.width}x${photo.height} - \`${photo.file_id}\``
        ).join('\n') +
        `\n\n💡 *Для использования в приветствии рекомендуется наилучшее качество (последний ID)*`;

      await this.bot.sendMessage(chatId, responseText, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id
      });
      
      console.log(`🖼 Photo file_id sent to admin ${chatId}: ${bestPhoto.file_id}`);
    } else {
      // Обычным пользователям отправляем приветственное сообщение
      await this.sendFirstMsg(chatId);
    }
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