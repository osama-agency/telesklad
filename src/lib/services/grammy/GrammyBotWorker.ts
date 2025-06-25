import { Bot, webhookCallback } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { limit } from '@grammyjs/ratelimiter';
import { run } from '@grammyjs/runner';

import {
  ExtendedContext,
  CallbackContext,
  ConversationContext,
  BotSettings,
  PerformanceMetrics,
  RateLimitConfig,
  OrderData,
  UserState
} from './types/grammy-types';

import { prisma } from '@/libs/prismaDb';
import { SettingsService } from '../SettingsService';
import { UserService } from '../UserService';
import { ReportService } from '../ReportService';
import { RedisService } from '../redis.service';
import { CacheService } from '../cache.service';
import { logger } from '@/lib/logger';
import { RedisQueueService } from '../redis-queue.service';
import { KeyboardUtils } from './utils/keyboard-utils';
import { TrackingConversation } from './conversations/TrackingConversation';

/**
 * GrammyBotWorker - современная замена TelegramBotWorker на базе grammY
 * 
 * Ключевые улучшения по сравнению со старой версией:
 * - Типобезопасность 100%
 * - Модульная архитектура
 * - Встроенная поддержка conversations
 * - Автоматическая обработка ошибок
 * - Rate limiting из коробки
 * - Middleware pattern
 * - Лучшая производительность
 */
export class GrammyBotWorker {
  private bot: Bot<ExtendedContext>;
  private settings: BotSettings = {};
  private metrics: PerformanceMetrics = {
    messagesProcessed: 0,
    errorsCount: 0,
    averageResponseTime: 0,
    callbacksHandled: 0,
    conversationsStarted: 0,
    webhookRequestsReceived: 0,
    lastResetTime: new Date()
  };
  
  private static instances: Map<string, GrammyBotWorker> = new Map();
  private isInitialized = false;

  private constructor() {
    // Создаем бот без токена (будет установлен в initialize)
    this.bot = new Bot('placeholder-token');
  }

  static getInstance(instanceName: string = 'default'): GrammyBotWorker {
    if (!this.instances.has(instanceName)) {
      this.instances.set(instanceName, new GrammyBotWorker());
    }
    return this.instances.get(instanceName)!;
  }

  /**
   * Инициализация бота с полной настройкой
   */
  async initialize(token?: string): Promise<void> {
    try {
      // Получаем токен если не передан
      const botToken = token || await SettingsService.get('client_bot_token', process.env.WEBAPP_TELEGRAM_BOT_TOKEN);
      if (!botToken) {
        throw new Error('Telegram bot token not found');
      }

      // Создаем новый экземпляр бота с правильным токеном
      this.bot = new Bot<ExtendedContext>(botToken);

      logger.info('🚀 Initializing grammY bot...', undefined, 'Grammy');

      // ВАЖНО: Инициализируем бот для получения информации о нем
      await this.bot.init();
      logger.info('✅ Bot info loaded', undefined, 'Grammy');

      // Инициализируем Redis если доступен
      await this.initializeRedis();

      // Загружаем настройки
      await this.loadSettings();

      // Настраиваем middleware (порядок важен!)
      this.setupMiddleware();

      // Настраиваем rate limiting
      this.setupRateLimit();

      // Настраиваем conversations
      this.setupConversations();

      // Настраиваем обработчики
      this.setupCommands();
      this.setupCallbacks();
      this.setupMessages();

      // Глобальная обработка ошибок
      this.setupErrorHandling();

      this.isInitialized = true;
      logger.info('✅ GrammyBotWorker initialized successfully', undefined, 'Grammy');

    } catch (error) {
      logger.error('❌ Failed to initialize GrammyBotWorker', { error: error.message }, 'Grammy');
      throw error;
    }
  }

  /**
   * Инициализация Redis сервиса
   */
  private async initializeRedis(): Promise<void> {
    try {
      await RedisService.initialize();
      if (RedisService.isAvailable()) {
        logger.info('✅ Redis initialized for Grammy', undefined, 'Grammy');
      }
    } catch (error) {
      logger.warn('⚠️ Redis not available, using memory fallback', { error: (error as Error).message }, 'Grammy');
    }
  }

  /**
   * Загрузка настроек из базы данных через SettingsService
   */
  private async loadSettings(): Promise<void> {
    try {
      // Используем новый SettingsService для загрузки настроек
      const settings = await SettingsService.getBotSettings();
      
      this.settings = {
        tg_main_bot: process.env.TELEGRAM_BOT_USERNAME || '@strattera_bot',
        admin_chat_id: settings.admin_chat_id,
        courier_tg_id: settings.courier_tg_id,
        preview_msg: settings.welcome_message,
        bot_btn_title: settings.bot_btn_title,
        group_btn_title: settings.group_btn_title,
        tg_group: settings.tg_group,
        tg_support: settings.tg_support,
        first_video_id: settings.first_video_id,
        
        // Сообщения для заказов
        tg_msg_unpaid_main: settings.tg_msg_unpaid_main,
        tg_msg_paid_client: settings.tg_msg_paid_client,
        tg_msg_paid_admin: settings.tg_msg_paid_admin,
        tg_msg_on_processing_client: settings.tg_msg_on_processing_client,
        tg_msg_on_processing_courier: settings.tg_msg_on_processing_courier,
        tg_msg_set_track_num: settings.tg_msg_set_track_num,
        tg_msg_on_shipped_courier: settings.tg_msg_on_shipped_client,
        
        // Дополнительные настройки
        webapp_url: settings.webapp_url || process.env.WEBAPP_URL,
        support_btn_title: settings.support_btn_title || 'Задать вопрос'
      };

      logger.info('📋 Bot settings loaded via SettingsService', undefined, 'Grammy');

    } catch (error) {
      logger.error('❌ Failed to load bot settings', { error: (error as Error).message }, 'Grammy');
      // Используем fallback настройки
      this.settings = {
        admin_chat_id: '125861752',
        courier_tg_id: '7690550402',
        admin_ids: '125861752',
        preview_msg: 'Добро пожаловать!',
        bot_btn_title: 'Каталог',
        group_btn_title: 'Наша группа',
        tg_group: 'https://t.me/+2rTVT8IxtFozNDY0',
        tg_support: 'https://t.me/strattera_help'
      };
    }
  }

  /**
   * Настройка middleware (порядок выполнения важен!)
   */
  private setupMiddleware(): void {
    // 1. Метрики и логирование
    this.bot.use(this.createMetricsMiddleware());
    
    // 2. Аутентификация и добавление пользователя в контекст
    this.bot.use(this.createAuthMiddleware());
    
    // 3. Логирование запросов
    this.bot.use(this.createLoggingMiddleware());
    
    // 4. Валидация входящих данных
    this.bot.use(this.createValidationMiddleware());
  }

  /**
   * Настройка rate limiting
   */
  private setupRateLimit(): void {
    const rateLimitConfig: RateLimitConfig = {
      timeFrame: 60000, // 1 минута
      limit: 20, // 20 сообщений в минуту
      keyGenerator: (ctx) => {
        // Для админов отдельный лимит
        if (this.isAdmin(ctx.from?.id)) {
          return `admin_${ctx.from?.id}`;
        }
        return ctx.from?.id.toString() || 'anonymous';
      },
      onLimitExceeded: async (ctx) => {
        await ctx.reply(
          '⏱️ Слишком много сообщений. Подождите минуту.',
          { reply_markup: undefined }
        );
      }
    };

    this.bot.use(limit(rateLimitConfig));
  }

  /**
   * Настройка conversations
   */
  private setupConversations(): void {
    this.bot.use(conversations());
    
    // Регистрируем conversation для ввода трек-номера
    this.bot.use(createConversation(this.trackingConversation.bind(this), 'tracking'));
    
    logger.info('🗣️ Conversations initialized', undefined, 'Grammy');
  }

  /**
   * Настройка команд
   */
  private setupCommands(): void {
    // Команда /start
    this.bot.command('start', async (ctx) => {
      await this.handleStartCommand(ctx);
    });

    // Команда /admin (только для админов)
    this.bot.command('admin', async (ctx) => {
      if (this.isAdmin(ctx.from?.id)) {
        await this.handleAdminCommand(ctx);
      } else {
        await ctx.reply('❌ У вас нет прав доступа к этой команде.');
      }
    });

    // Команда /test (только для админов)
    this.bot.command('test', async (ctx) => {
      if (this.isAdmin(ctx.from?.id)) {
        await this.handleTestCommand(ctx);
      }
    });

    logger.info('⚡ Commands initialized', undefined, 'Grammy');
  }

  /**
   * Настройка обработчиков callback'ов
   */
  private setupCallbacks(): void {
    // Callback "Я оплатил"
    this.bot.callbackQuery(/^i_paid_(\d+)$/, async (ctx) => {
      const orderId = ctx.match[1];
      await this.handleIPaidCallback(ctx, orderId);
    });

    // Callback "Оплата пришла" (админ)
    this.bot.callbackQuery(/^approve_payment_(\d+)$/, async (ctx) => {
      const orderId = ctx.match[1];
      await this.handleApprovePaymentCallback(ctx, orderId);
    });

    // Callback "Привязать трек-номер"
    this.bot.callbackQuery(/^submit_tracking_(\d+)$/, async (ctx) => {
      const orderId = ctx.match[1];
      await this.handleSubmitTrackingCallback(ctx, orderId);
    });

    // Callback "Назад" для трекинга
    this.bot.callbackQuery('track_back', async (ctx) => {
      await this.handleTrackBackCallback(ctx);
    });

    // Тестовый callback
    this.bot.callbackQuery('test_callback', async (ctx) => {
      await ctx.answerCallbackQuery('✅ grammY callback работает!');
      await ctx.editMessageText('🎉 grammY callback успешно обработан!');
    });

    logger.info('🔘 Callback handlers initialized', undefined, 'Grammy');
  }

  /**
   * Настройка обработчиков сообщений
   */
  private setupMessages(): void {
    // Обработка текстовых сообщений
    this.bot.on('message:text', async (ctx) => {
      await this.handleTextMessage(ctx);
    });

    // Обработка видео (для админов)
    this.bot.on('message:video', async (ctx) => {
      logger.info('📹 Video message received', { 
        userId: ctx.from?.id,
        isAdmin: this.isAdmin(ctx.from?.id),
        videoFileId: ctx.message?.video?.file_id,
        videoSize: `${ctx.message?.video?.width}x${ctx.message?.video?.height}`
      }, 'Grammy');
      
      if (this.isAdmin(ctx.from?.id)) {
        await this.handleVideoMessage(ctx);
      } else {
        await this.sendWelcomeMessage(ctx);
      }
    });

    // Обработка фото (для админов)
    this.bot.on('message:photo', async (ctx) => {
      logger.info('🖼 Photo message received', { 
        userId: ctx.from?.id,
        isAdmin: this.isAdmin(ctx.from?.id),
        photoCount: ctx.message?.photo?.length
      }, 'Grammy');
      
      if (this.isAdmin(ctx.from?.id)) {
        await this.handlePhotoMessage(ctx);
      } else {
        await this.sendWelcomeMessage(ctx);
      }
    });

    // Обработка остальных типов сообщений (НЕ текст, НЕ видео, НЕ фото)
    this.bot.on('message', async (ctx) => {
      // Пропускаем текстовые сообщения, видео и фото - они обрабатываются выше
      if (ctx.message?.text || ctx.message?.video || ctx.message?.photo) {
        return;
      }
      
      // Логируем остальные типы сообщений
      const messageType = ctx.message?.document ? 'document' :
                         ctx.message?.voice ? 'voice' :
                         ctx.message?.audio ? 'audio' :
                         ctx.message?.sticker ? 'sticker' :
                         ctx.message?.animation ? 'animation' :
                         ctx.message?.location ? 'location' :
                         ctx.message?.contact ? 'contact' : 'unknown';
                         
      logger.info('📨 Other message received', { 
        type: messageType,
        userId: ctx.from?.id,
        isAdmin: this.isAdmin(ctx.from?.id)
      }, 'Grammy');
      
      // Для всех остальных типов отправляем приветственное сообщение
      await this.sendWelcomeMessage(ctx);
    });

    logger.info('💬 Message handlers initialized', undefined, 'Grammy');
  }

  /**
   * Настройка глобальной обработки ошибок
   */
  private setupErrorHandling(): void {
    this.bot.catch(async (err) => {
      this.metrics.errorsCount++;
      
      const error = err.error as Error;
      logger.error('❌ grammY bot error', {
        error: error.message,
        stack: error.stack,
        updateType: err.ctx.update.update_id ? 'update' : 'unknown',
        userId: err.ctx.from?.id
      }, 'Grammy');

      try {
        // Пытаемся отправить пользователю сообщение об ошибке
        if (err.ctx.chat?.type === 'private') {
          await err.ctx.reply(
            '😔 Произошла ошибка при обработке вашего запроса. Попробуйте позже или обратитесь в поддержку.',
            { reply_markup: undefined }
          );
        }
      } catch (replyError) {
        logger.error('❌ Failed to send error message to user', { error: (replyError as Error).message }, 'Grammy');
      }

      // Уведомляем админа о критических ошибках
      if (this.settings.admin_chat_id) {
        try {
          await this.bot.api.sendMessage(
            this.settings.admin_chat_id,
            `🚨 grammY Bot Error\n\n` +
            `Error: ${error.message}\n` +
            `User: ${err.ctx.from?.id}\n` +
            `Update: ${err.ctx.update.update_id || 'unknown'}\n` +
            `Time: ${new Date().toISOString()}`
          );
        } catch (adminNotifyError) {
          logger.error('❌ Failed to notify admin about error', { error: (adminNotifyError as Error).message }, 'Grammy');
        }
      }
    });
  }

  // ========================
  // MIDDLEWARE FACTORIES
  // ========================

  /**
   * Middleware для метрик производительности
   */
  private createMetricsMiddleware() {
    return async (ctx: ExtendedContext, next: () => Promise<void>) => {
      const startTime = performance.now();
      ctx.metrics = { startTime };

      try {
        await next();
        
        // Обновляем метрики успешной обработки
        const duration = performance.now() - startTime;
        this.updateMetrics(duration, false);
        
        ctx.metrics.processingDuration = duration;
        
      } catch (error) {
        // Обновляем метрики ошибки
        this.updateMetrics(performance.now() - startTime, true);
        throw error;
      }
    };
  }

  /**
   * Middleware для аутентификации и добавления пользователя
   */
  private createAuthMiddleware() {
    return async (ctx: ExtendedContext, next: () => Promise<void>) => {
      if (ctx.from) {
        try {
          // Находим или создаем пользователя
          const user = await UserService.handleTelegramStart({
            id: ctx.from.id,
            first_name: ctx.from.first_name,
            last_name: ctx.from.last_name,
            username: ctx.from.username
          });

          // Добавляем пользователя в контекст
          ctx.user = user as any; // Temporary type fix

          // Дополнительная информация
          ctx.messageInfo = {
            isFromAdmin: this.isAdmin(ctx.from.id),
            isFromCourier: this.isCourier(ctx.from.id),
            processingStartTime: performance.now()
          };

        } catch (error) {
          logger.warn('⚠️ Failed to load user in auth middleware', { 
            error: (error as Error).message, 
            userId: ctx.from.id 
          }, 'Grammy');
        }
      }

      await next();
    };
  }

  /**
   * Middleware для логирования
   */
  private createLoggingMiddleware() {
    return async (ctx: ExtendedContext, next: () => Promise<void>) => {
      logger.info('📨 Processing update', {
        updateType: ctx.message ? 'message' : ctx.callbackQuery ? 'callback_query' : 'unknown',
        userId: ctx.from?.id,
        chatId: ctx.chat?.id,
        text: ctx.message?.text ? ctx.message.text.substring(0, 100) : undefined,
        callbackData: ctx.callbackQuery?.data
      }, 'Grammy');

      await next();

      const duration = ctx.metrics?.processingDuration;
      if (duration !== undefined) {
        logger.info('✅ Update processed', {
          updateType: ctx.message ? 'message' : ctx.callbackQuery ? 'callback_query' : 'unknown',
          userId: ctx.from?.id,
          duration: Math.round(duration)
        }, 'Grammy');
      }
    };
  }

  /**
   * Middleware для валидации входящих данных
   */
  private createValidationMiddleware() {
    return async (ctx: ExtendedContext, next: () => Promise<void>) => {
      // Базовая валидация
      if (!ctx.from) {
        logger.warn('⚠️ Received update without from field', undefined, 'Grammy');
        return; // Игнорируем обновления без отправителя
      }

      // Проверка на спам (слишком длинные сообщения)
      if (ctx.message?.text && ctx.message.text.length > 4000) {
        logger.warn('⚠️ Received too long message', { 
          userId: ctx.from.id, 
          length: ctx.message.text.length 
        }, 'Grammy');
        
        await ctx.reply('📝 Сообщение слишком длинное. Попробуйте сократить текст.');
        return;
      }

      await next();
    };
  }

  // ========================
  // COMMAND HANDLERS
  // ========================

  /**
   * Обработчик команды /start
   */
  private async handleStartCommand(ctx: ExtendedContext): Promise<void> {
    try {
      // Пользователь уже загружен в auth middleware
      if (ctx.user?.isNew) {
        await this.notifyAdminNewUser(ctx.user);
      }

      await this.sendWelcomeMessage(ctx);
      
    } catch (error) {
      logger.error('❌ Error in /start command', { error: (error as Error).message }, 'Grammy');
      await ctx.reply('😔 Произошла ошибка. Попробуйте позже.');
    }
  }

  /**
   * Обработчик команды /admin
   */
  private async handleAdminCommand(ctx: ExtendedContext): Promise<void> {
    const adminInfo = this.buildAdminInfoMessage();
    await ctx.reply(adminInfo, { parse_mode: 'HTML' });
  }

  /**
   * Обработчик команды /test
   */
  private async handleTestCommand(ctx: ExtendedContext): Promise<void> {
    await this.sendWelcomeMessage(ctx);
  }

  // ========================
  // CALLBACK HANDLERS (FULL IMPLEMENTATION)
  // ========================

  /**
   * Обработчик callback "Я оплатил" - полная реализация
   */
  private async handleIPaidCallback(ctx: CallbackContext, orderId: string): Promise<void> {
    try {
      const callbackAge = Date.now() - ((ctx.callbackQuery.message?.date || 0) * 1000);
      const MAX_CALLBACK_AGE = 24 * 60 * 60 * 1000; // 24 часа
      
      if (callbackAge > MAX_CALLBACK_AGE) {
        logger.warn('⚠️ I_paid callback too old, skipping', { userId: ctx.from?.id, orderId }, 'Grammy');
        
        await ctx.reply('Кнопка устарела. Пожалуйста, оформите новый заказ через каталог.');
        return;
      }

      // Быстрый ответ пользователю
      try {
        await ctx.answerCallbackQuery('💳 Идет проверка вашего перевода...');
      } catch (callbackError: any) {
        if (callbackError.message?.includes('query is too old') || 
            callbackError.message?.includes('query ID is invalid')) {
          logger.warn('⚠️ I_paid callback query expired', { userId: ctx.from?.id, orderId }, 'Grammy');
        } else {
          logger.error('❌ Error answering i_paid callback', { error: callbackError.message }, 'Grammy');
        }
      }

      // Получаем пользователя и обновляем заказ
      let user = null;
      try {
        // Попытка получить из кэша, затем из БД
        user = await RedisService.getUserData(ctx.from!.id.toString())
          .then(cachedUser => cachedUser || prisma.users.findUnique({ 
            where: { tg_id: BigInt(ctx.from!.id) }
          }))
          .catch(() => prisma.users.findUnique({ 
            where: { tg_id: BigInt(ctx.from!.id) }
          }));
      } catch (fetchError) {
        logger.error('❌ Error fetching user data', { error: (fetchError as Error).message, userId: ctx.from?.id }, 'Grammy');
        user = await prisma.users.findUnique({ 
          where: { tg_id: BigInt(ctx.from!.id) }
        });
      }

      if (!user) {
        logger.warn('⚠️ User not found for i_paid callback', { userId: ctx.from?.id, orderId }, 'Grammy');
        return;
      }

      // Обновляем заказ на статус "paid"
      const updatedOrder = await prisma.orders.update({
        where: { id: BigInt(orderId) },
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

      logger.info('✅ Order status updated to paid', { orderId, userId: ctx.from?.id }, 'Grammy');

      // Отправляем уведомления через ReportService
      const orderForReport = {
        ...updatedOrder,
        msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
      };
      
      // Пытаемся добавить в Redis очередь для асинхронной обработки
      let notificationSent = false;
      if (RedisService.isAvailable()) {
        try {
          await RedisQueueService.addNotificationJob('order_status_change', {
            order: orderForReport,
            previousStatus: 0 // unpaid
          });
          notificationSent = true;
          logger.info('✅ Notification job added to Redis queue', { orderId }, 'Grammy');
        } catch (redisError) {
          logger.warn('⚠️ Redis notification failed, using fallback', { error: (redisError as Error).message }, 'Grammy');
        }
      }
      
      // Если Redis недоступен, обрабатываем синхронно
      if (!notificationSent) {
        await ReportService.handleOrderStatusChange(orderForReport as any, 0);
        logger.info('✅ Notification handled synchronously', { orderId }, 'Grammy');
      }

      // Кэшируем данные пользователя
      if (RedisService.isAvailable()) {
        try {
          await RedisService.setUserData(ctx.from!.id.toString(), user);
        } catch (cacheError) {
          logger.warn('⚠️ Failed to cache user data', { error: (cacheError as Error).message }, 'Grammy');
        }
      }

      this.metrics.callbacksHandled++;

    } catch (error) {
      logger.error('❌ Error in handleIPaidCallback', { 
        error: (error as Error).message, 
        orderId, 
        userId: ctx.from?.id 
      }, 'Grammy');
      
      // Уведомляем пользователя об ошибке
      try {
        await ctx.answerCallbackQuery('😔 Произошла ошибка. Попробуйте еще раз или обратитесь в поддержку.');
      } catch (answerError) {
        logger.error('❌ Failed to send error callback answer', { error: answerError.message }, 'Grammy');
      }
    }
  }

  /**
   * Обработчик callback "Оплата пришла" (админ) - полная реализация
   */
  private async handleApprovePaymentCallback(ctx: CallbackContext, orderId: string): Promise<void> {
    try {
      const callbackAge = Date.now() - ((ctx.callbackQuery.message?.date || 0) * 1000);
      const MAX_CALLBACK_AGE = 24 * 60 * 60 * 1000; // 24 часа
      
      if (callbackAge > MAX_CALLBACK_AGE) {
        logger.warn('⚠️ Admin approve_payment callback too old', { userId: ctx.from?.id, orderId }, 'Grammy');
        return;
      }

      // Определяем тип бота для правильной обработки
      const messageBotId = ctx.callbackQuery.message?.from?.id;
      const isMainBot = messageBotId === 7612206140; // @telesklad_bot
      
      logger.info('🤖 Approve payment callback', { 
        botId: messageBotId, 
        isMainBot, 
        orderId, 
        adminId: ctx.from?.id 
      }, 'Grammy');

      // Быстрый ответ на callback
      try {
        await ctx.answerCallbackQuery('✅ Подтверждаем оплату...');
      } catch (callbackError: any) {
        if (callbackError.message?.includes('query is too old') || 
            callbackError.message?.includes('query ID is invalid')) {
          logger.warn('⚠️ Admin callback query expired', { userId: ctx.from?.id, orderId }, 'Grammy');
        } else {
          logger.error('❌ Error answering admin callback', { error: callbackError.message }, 'Grammy');
        }
      }

      // Получаем заказ с полной информацией
      const order = await prisma.orders.findUnique({
        where: { id: BigInt(orderId) },
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

      if (!order) {
        logger.warn('⚠️ Order not found for approve_payment', { orderId }, 'Grammy');
        return;
      }

      const previousStatus = order.status;

      // Обновляем статус заказа на "processing" (в обработке)
      const updatedOrder = await prisma.orders.update({
        where: { id: BigInt(orderId) },
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
          users: true,
          bank_cards: true
        }
      });

      logger.info('✅ Order status updated to processing', { orderId, previousStatus }, 'Grammy');

      // Формируем новый текст сообщения для админа
      const user = updatedOrder.users;
      const orderItems = updatedOrder.order_items;
      
      const itemsStr = orderItems.map(item => 
        `• ${item.products.name} — ${item.quantity}шт. — ${item.price}₽`
      ).join(',\n');

      const bankCardInfo = updatedOrder.bank_cards 
        ? `${updatedOrder.bank_cards.name} — ${updatedOrder.bank_cards.fio} — ${updatedOrder.bank_cards.number}`
        : 'Не указана';

      const fullAddress = this.buildFullAddress(user);
      const fullName = this.getFullName(user);

      const deliveryCost = updatedOrder.deliverycost || 0;
      const totalPaid = Number(updatedOrder.total_amount) + Number(deliveryCost);

      let newMessageText = `📲 Заказ №${orderId} отправлен курьеру!\n\n` +
        `Итого клиент оплатил: ${totalPaid}₽\n\n` +
        `Банк: ${bankCardInfo}\n\n` +
        `📄 Состав заказа:\n${itemsStr}\n\n` +
        `📍 Адрес:\n${fullAddress}\n\n` +
        `👤 ФИО:\n${fullName}\n\n` +
        `📱 Телефон:\n${user.phone_number || 'Не указан'}`;

      // Добавляем маркер development если нужно
      if (process.env.NODE_ENV === 'development') {
        newMessageText = `‼️‼️Development‼️‼️\n\n${newMessageText}`;
      }

      // Редактируем сообщение через правильный бот
      try {
        if (isMainBot) {
          // Редактируем через основной бот (@telesklad_bot)
          const MAIN_BOT_TOKEN = '7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4';
          
          const editResponse = await fetch(`https://api.telegram.org/bot${MAIN_BOT_TOKEN}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: ctx.callbackQuery.message?.chat.id,
              message_id: ctx.callbackQuery.message?.message_id,
              text: newMessageText,
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: [] } // Убираем кнопки
            })
          });

          const editResult = await editResponse.json();
          if (!editResult.ok) {
            logger.warn('⚠️ Could not edit message via main bot', { error: editResult.description }, 'Grammy');
          } else {
            logger.info('✅ Message edited successfully via main bot', { orderId }, 'Grammy');
          }
        } else {
          // Редактируем через текущий Grammy бот
          await ctx.editMessageText(newMessageText, {
            parse_mode: 'HTML',
            reply_markup: undefined // Убираем кнопки
          });
          logger.info('✅ Message edited successfully via Grammy bot', { orderId }, 'Grammy');
        }
      } catch (editError) {
        logger.error('❌ Could not edit admin message', { error: editError.message, orderId }, 'Grammy');
      }

      // Отправляем уведомления через ReportService (включая сообщение клиенту)
      if (previousStatus !== updatedOrder.status) {
        const orderForReport = {
          ...updatedOrder,
          msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
        };
        await ReportService.handleOrderStatusChange(orderForReport as any, previousStatus);
        logger.info('✅ Order status change notifications sent', { orderId, previousStatus, newStatus: updatedOrder.status }, 'Grammy');
      }

      this.metrics.callbacksHandled++;

    } catch (error) {
      logger.error('❌ Error in handleApprovePaymentCallback', { 
        error: error.message, 
        orderId, 
        userId: ctx.from?.id 
      }, 'Grammy');
    }
  }

  /**
   * Обработчик callback "Привязать трек-номер" - полная реализация
   */
  private async handleSubmitTrackingCallback(ctx: CallbackContext, orderId: string): Promise<void> {
    try {
      const text = ctx.callbackQuery.message?.text || '';
      const orderNumber = this.parseOrderNumber(text);
      const fullName = this.parseFullName(text);
      
      if (!orderNumber) {
        logger.warn('⚠️ Could not parse order number from tracking callback', { userId: ctx.from?.id }, 'Grammy');
        return;
      }

      // Определяем тип бота
      const messageBotId = ctx.callbackQuery.message?.from?.id;
      const isMainBot = messageBotId === 7612206140; // @telesklad_bot
      
      logger.info('🤖 Submit tracking callback', { 
        botId: messageBotId, 
        isMainBot, 
        orderNumber, 
        userId: ctx.from?.id 
      }, 'Grammy');

      // Создаем клавиатуру с кнопкой "Назад"
      const keyboard = KeyboardUtils.createBackKeyboard('track_back');

      let msgId: number;

      if (isMainBot) {
        // Отправляем через основной бот (@telesklad_bot)
        const MAIN_BOT_TOKEN = '7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4';
        
        const response = await fetch(`https://api.telegram.org/bot${MAIN_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ctx.callbackQuery.message?.chat.id,
            text: `📦 Введите трек-номер для заказа №${orderNumber}\n\n👤 ФИО:\n${fullName || 'Не указано'}`,
            reply_markup: keyboard
          })
        });

        const result = await response.json();
        if (result.ok) {
          msgId = result.result.message_id;
          logger.info('✅ Tracking request sent via main bot', { orderNumber }, 'Grammy');
        } else {
          throw new Error(`Main bot API error: ${result.description}`);
        }

        // Отвечаем на callback через основной бот
        await fetch(`https://api.telegram.org/bot${MAIN_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: ctx.callbackQuery.id,
            text: '📝 Введите трек-номер в чат'
          })
        });

      } else {
        // Отправляем через Grammy бот
        const msg = await ctx.reply(
          `📦 Введите трек-номер для заказа №${orderNumber}\n\n👤 ФИО:\n${fullName || 'Не указано'}`,
          { reply_markup: keyboard }
        );
        
        msgId = msg.message_id;
        logger.info('✅ Tracking request sent via Grammy bot', { orderNumber }, 'Grammy');

        // Отвечаем на callback
        await ctx.answerCallbackQuery('📝 Введите трек-номер в чат');
      }

      // Сохраняем состояние для conversation
      await this.saveUserState(orderNumber, ctx.callbackQuery.message?.message_id || 0, msgId, ctx.chat?.id || 0);

      this.metrics.callbacksHandled++;

    } catch (error) {
      logger.error('❌ Error in handleSubmitTrackingCallback', { 
        error: error.message, 
        userId: ctx.from?.id 
      }, 'Grammy');
      
      try {
        await ctx.answerCallbackQuery('😔 Произошла ошибка. Попробуйте еще раз.');
      } catch (answerError) {
        logger.error('❌ Failed to send error callback answer', { error: answerError.message }, 'Grammy');
      }
    }
  }

  /**
   * Обработчик callback "Назад" для трекинга - полная реализация
   */
  private async handleTrackBackCallback(ctx: CallbackContext): Promise<void> {
    try {
      const text = ctx.callbackQuery.message?.text || '';
      const orderNumber = this.parseOrderNumber(text);
      
      if (!orderNumber) {
        logger.warn('⚠️ Could not parse order number from track_back callback', { userId: ctx.from?.id }, 'Grammy');
        return;
      }

      // Определяем тип бота
      const messageBotId = ctx.callbackQuery.message?.from?.id;
      const isMainBot = messageBotId === 7612206140; // @telesklad_bot
      
      logger.info('🤖 Track back callback', { 
        botId: messageBotId, 
        isMainBot, 
        orderNumber, 
        userId: ctx.from?.id 
      }, 'Grammy');

      // Получаем детали заказа
      const order = await prisma.orders.findUnique({
        where: { id: BigInt(orderNumber) },
        include: {
          order_items: {
            include: {
              products: true
            }
          },
          users: true
        }
      });

      if (!order) {
        logger.warn('⚠️ Order not found for track_back', { orderNumber }, 'Grammy');
        return;
      }

      const user = order.users;
      const orderItemsStr = order.order_items.map(item => 
        `• ${item.products.name} — ${item.quantity}шт.`
      ).join('\n');
      const fullAddress = this.buildFullAddress(user);

      // Восстанавливаем исходное сообщение курьера
      const courierMsg = `👀 Нужно отправить заказ №${orderNumber}\n\n` +
        `📄 Состав заказа:\n${orderItemsStr}\n\n` +
        `📍 Адрес:\n${fullAddress}\n\n` +
        `📍 Индекс: ${user.postal_code || 'Не указан'}\n\n` +
        `👤 ФИО:\n${this.getFullName(user)}\n\n` +
        `📱 Телефон:\n${user.phone_number || 'Не указан'}`;

      const keyboard = KeyboardUtils.createCourierKeyboard(orderNumber);

      if (isMainBot) {
        // Обновляем сообщение через основной бот (@telesklad_bot)
        const MAIN_BOT_TOKEN = '7612206140:AAHA6sV7VZLyUu0Ua1DAoULiFYehAkAjJK4';
        
        const editResponse = await fetch(`https://api.telegram.org/bot${MAIN_BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ctx.callbackQuery.message?.chat.id,
            message_id: ctx.callbackQuery.message?.message_id,
            text: courierMsg,
            reply_markup: keyboard
          })
        });

        const editResult = await editResponse.json();
        if (editResult.ok) {
          logger.info('✅ Message updated via main bot', { orderNumber }, 'Grammy');
        } else {
          logger.warn('⚠️ Could not edit message via main bot', { error: editResult.description }, 'Grammy');
        }

        // Отвечаем на callback через основной бот
        await fetch(`https://api.telegram.org/bot${MAIN_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: ctx.callbackQuery.id,
            text: '⬅️ Возврат к деталям заказа'
          })
        });

      } else {
        // Обновляем сообщение через Grammy бот
        await ctx.editMessageText(courierMsg, {
          reply_markup: keyboard
        });

        await ctx.answerCallbackQuery('⬅️ Возврат к деталям заказа');
        logger.info('✅ Message updated via Grammy bot', { orderNumber }, 'Grammy');
      }

      // Очищаем состояние пользователя
      await RedisService.clearUserState(`user_${ctx.chat?.id}_state`);

      this.metrics.callbacksHandled++;

    } catch (error) {
      logger.error('❌ Error in handleTrackBackCallback', { 
        error: error.message, 
        userId: ctx.from?.id 
      }, 'Grammy');
      
      try {
        await ctx.answerCallbackQuery('😔 Произошла ошибка. Попробуйте еще раз.');
      } catch (answerError) {
        logger.error('❌ Failed to send error callback answer', { error: answerError.message }, 'Grammy');
      }
    }
  }

  // ========================
  // MESSAGE HANDLERS (IMPLEMENTATIONS)
  // ========================

  /**
   * Обработчик текстовых сообщений - полная реализация
   */
  private async handleTextMessage(ctx: ExtendedContext): Promise<void> {
    const messageText = ctx.message?.text || '';
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;

    logger.info('📨 Text message received', { 
      userId, 
      chatId,
      textLength: messageText.length,
      textPreview: messageText.substring(0, 50)
    }, 'Grammy');

    // Проверяем, не является ли это сообщением от курьера
    if (this.isCourier(userId)) {
      await this.handleCourierMessage(ctx, messageText);
      return;
    }

    // Проверяем, не находится ли пользователь в conversation
    const userState = await RedisService.getUserState(`user_${chatId}_state`);
    if (userState && userState.mode === 'tracking') {
      logger.info('👤 User in tracking conversation, letting conversation handle', { 
        userId, 
        orderId: userState.order_id 
      }, 'Grammy');
      // Conversation сам обработает это сообщение
      return;
    }

    // Для обычных пользователей отправляем приветствие
    await this.sendWelcomeMessage(ctx);
  }

  /**
   * Обработчик сообщений от курьера - полная реализация
   */
  private async handleCourierMessage(ctx: ExtendedContext, messageText: string): Promise<void> {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;

    logger.info('📦 Courier message detected', { 
      userId, 
      messageText: messageText.substring(0, 100) 
    }, 'Grammy');

    try {
      // Проверяем состояние курьера
      const courierState = await RedisService.getUserState(`user_${chatId}_state`);
      
      if (courierState && courierState.mode === 'tracking') {
        // Курьер в процессе ввода трек-номера - пропускаем для conversation
        logger.info('📦 Courier in tracking conversation', { 
          userId, 
          orderId: courierState.order_id 
        }, 'Grammy');
        return;
      }

      // Попытка распознать трек-номер в сообщении
      const possibleTrackingNumber = messageText.trim();
      
      if (TrackingConversation.isValidTrackingNumber(possibleTrackingNumber)) {
        await this.handleDirectTrackingInput(ctx, possibleTrackingNumber);
        return;
      }

      // Попытка найти номер заказа в сообщении
      const orderNumber = this.parseOrderNumber(messageText);
      if (orderNumber) {
        await this.handleOrderReference(ctx, orderNumber, messageText);
        return;
      }

      // Общие команды курьера
      if (messageText.toLowerCase().includes('помощь') || messageText === '/help') {
        await this.sendCourierHelp(ctx);
        return;
      }

      if (messageText.toLowerCase().includes('статус') || messageText.toLowerCase().includes('заказы')) {
        await this.sendCourierStatus(ctx);
        return;
      }

      // Неопознанное сообщение курьера
      await ctx.reply(
        '🤔 Не понял сообщение.\n\n' +
        '💡 <b>Доступные команды:</b>\n' +
        '• Отправьте трек-номер для привязки\n' +
        '• Напишите "помощь" для справки\n' +
        '• Напишите "статус" для проверки заказов\n\n' +
        '📱 Или используйте кнопки в сообщениях о заказах.',
        { parse_mode: 'HTML' }
      );

    } catch (error) {
      logger.error('❌ Error handling courier message', { 
        error: (error as Error).message,
        userId,
        messageText: messageText.substring(0, 50)
      }, 'Grammy');

      await ctx.reply('😔 Произошла ошибка. Попробуйте еще раз или обратитесь в поддержку.');
    }
  }

  /**
   * Обработка прямого ввода трек-номера курьером
   */
  private async handleDirectTrackingInput(ctx: ExtendedContext, trackingNumber: string): Promise<void> {
    logger.info('📦 Direct tracking number input detected', { 
      userId: ctx.from?.id,
      trackingPreview: trackingNumber.substring(0, 5) + '...'
    }, 'Grammy');

    await ctx.reply(
      `🔍 Обнаружен трек-номер: <code>${trackingNumber}</code>\n\n` +
      `Для какого заказа этот трек-номер?\n` +
      `Пожалуйста, используйте кнопку "Привязать трек-номер" в сообщении с заказом.`,
      { parse_mode: 'HTML' }
    );
  }

  /**
   * Обработка упоминания номера заказа курьером
   */
  private async handleOrderReference(ctx: ExtendedContext, orderNumber: string, fullMessage: string): Promise<void> {
    logger.info('📋 Order reference detected in courier message', { 
      userId: ctx.from?.id,
      orderNumber,
      message: fullMessage.substring(0, 100)
    }, 'Grammy');

    try {
      // Получаем информацию о заказе
      const order = await TrackingConversation.getOrderInfo(orderNumber);
      
      if (!order) {
        await ctx.reply(`❌ Заказ №${orderNumber} не найден.`);
        return;
      }

      // Отправляем краткую информацию о заказе
      const orderInfo = this.buildCourierOrderInfo(order);
      const keyboard = KeyboardUtils.createCourierKeyboard(orderNumber);

      await ctx.reply(orderInfo, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });

    } catch (error) {
      logger.error('❌ Error handling order reference', { 
        error: (error as Error).message,
        orderNumber
      }, 'Grammy');

      await ctx.reply(`😔 Ошибка при получении информации о заказе №${orderNumber}.`);
    }
  }

  /**
   * Отправка справки курьеру
   */
  private async sendCourierHelp(ctx: ExtendedContext): Promise<void> {
    const helpMessage = `📋 <b>Справка для курьера</b>\n\n` +
      `🚚 <b>Основные функции:</b>\n` +
      `• Получение заказов для отправки\n` +
      `• Привязка трек-номеров к заказам\n` +
      `• Подтверждение отправки\n\n` +
      `📝 <b>Как привязать трек-номер:</b>\n` +
      `1. Найдите сообщение с заказом\n` +
      `2. Нажмите "Привязать трек-номер"\n` +
      `3. Введите трек-номер в чат\n` +
      `4. Подтвердите отправку\n\n` +
      `🔢 <b>Форматы трек-номеров:</b>\n` +
      `• Почта России: RA123456789RU\n` +
      `• СДЭК: 1234567890\n` +
      `• DPD: буквы и цифры\n\n` +
      `💬 <b>Команды:</b>\n` +
      `• "статус" - проверить заказы\n` +
      `• "помощь" - эта справка`;

    await ctx.reply(helpMessage, { parse_mode: 'HTML' });
  }

  /**
   * Отправка статуса заказов курьеру
   */
  private async sendCourierStatus(ctx: ExtendedContext): Promise<void> {
    try {
      // Получаем заказы в статусе "processing" (готовые к отправке)
      const processingOrders = await prisma.orders.findMany({
        where: { status: 2 }, // processing
        include: {
          users: true,
          order_items: {
            include: {
              products: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10 // Последние 10 заказов
      });

      if (processingOrders.length === 0) {
        await ctx.reply('✅ Все заказы отправлены! Новых заказов для отправки нет.');
        return;
      }

      let statusMessage = `📊 <b>Заказы к отправке: ${processingOrders.length}</b>\n\n`;

      processingOrders.forEach((order, index) => {
        const orderItems = order.order_items.map(item => 
          `${item.products.name} (${item.quantity}шт.)`
        ).join(', ');

        statusMessage += `${index + 1}. <b>№${order.id}</b>\n` +
          `📄 ${orderItems}\n` +
          `👤 ${this.getFullName(order.users)}\n` +
          `📅 ${order.created_at.toLocaleDateString('ru-RU')}\n\n`;
      });

      statusMessage += `💡 Используйте кнопки в сообщениях о заказах для привязки трек-номеров.`;

      await ctx.reply(statusMessage, { parse_mode: 'HTML' });

    } catch (error) {
      logger.error('❌ Error getting courier status', { 
        error: (error as Error).message,
        userId: ctx.from?.id 
      }, 'Grammy');

      await ctx.reply('😔 Ошибка при получении статуса заказов.');
    }
  }

  /**
   * Построение информации о заказе для курьера
   */
  private buildCourierOrderInfo(order: any): string {
    const user = order.users;
    const orderItems = order.order_items;
    
    const itemsStr = orderItems.map((item: any) => 
      `• ${item.products.name} — ${item.quantity}шт.`
    ).join('\n');

    const fullAddress = this.buildFullAddress(user);

    return `📦 <b>Заказ №${order.id}</b>\n\n` +
      `📄 <b>Состав заказа:</b>\n${itemsStr}\n\n` +
      `📍 <b>Адрес:</b>\n${fullAddress}\n\n` +
      `👤 <b>ФИО:</b> ${this.getFullName(user)}\n` +
      `📱 <b>Телефон:</b> ${user.phone_number || 'Не указан'}\n` +
      `📅 <b>Дата заказа:</b> ${order.created_at.toLocaleDateString('ru-RU')}\n\n` +
      `📊 <b>Статус:</b> ${this.getOrderStatusText(order.status)}`;
  }

  /**
   * Получение текстового описания статуса заказа
   */
  private getOrderStatusText(status: number): string {
    const statusMap = {
      0: 'Неоплачен',
      1: 'Оплачен',
      2: 'В обработке',
      3: 'Отправлен',
      4: 'Доставлен',
      5: 'Отменен'
    };
    
    return statusMap[status as keyof typeof statusMap] || 'Неизвестно';
  }

  /**
   * Обработчик видео сообщений (для админов)
   */
  private async handleVideoMessage(ctx: ExtendedContext): Promise<void> {
    const video = ctx.message?.video;
    if (video) {
      await ctx.reply(
        `📹 *Видео получено!*\n\n` +
        `🆔 *File ID:* \`${video.file_id}\`\n` +
        `📏 *Размер:* ${video.width}x${video.height}\n` +
        `⏱ *Длительность:* ${video.duration} сек`,
        { parse_mode: 'Markdown' }
      );
      
      logger.info('📹 Video received from admin', { 
        fileId: video.file_id,
        userId: ctx.from?.id,
        size: `${video.width}x${video.height}`
      }, 'Grammy');
    }
  }

  /**
   * Обработчик фото сообщений (для админов)
   */
  private async handlePhotoMessage(ctx: ExtendedContext): Promise<void> {
    const photos = ctx.message?.photo;
    if (photos && photos.length > 0) {
      const bestPhoto = photos[photos.length - 1];
      await ctx.reply(
        `🖼 *Фото получено!*\n\n` +
        `🆔 *File ID:* \`${bestPhoto.file_id}\`\n` +
        `📏 *Размер:* ${bestPhoto.width}x${bestPhoto.height}`,
        { parse_mode: 'Markdown' }
      );
      
      logger.info('🖼 Photo received from admin', { 
        fileId: bestPhoto.file_id,
        userId: ctx.from?.id,
        size: `${bestPhoto.width}x${bestPhoto.height}`
      }, 'Grammy');
    }
  }

  /**
   * Conversation для ввода трек-номера - теперь использует TrackingConversation
   */
  private async trackingConversation(conversation: Conversation<ExtendedContext>, ctx: ExtendedContext): Promise<void> {
    logger.info('🗣️ Starting tracking conversation via GrammyBotWorker', { userId: ctx.from?.id }, 'Grammy');
    
    // Используем полную реализацию из TrackingConversation
    await TrackingConversation.trackingFlow(conversation, ctx);
    
    // Увеличиваем счетчик conversations
    this.metrics.conversationsStarted++;
  }

  /**
   * Отправка приветственного сообщения
   */
  private async sendWelcomeMessage(ctx: ExtendedContext): Promise<void> {
    const welcomeText = this.settings.preview_msg || 'Добро пожаловать в наш бот!';
    const keyboard = KeyboardUtils.createWelcomeKeyboard();
    
    try {
      // Пытаемся отправить видео, если есть video_id
      if (this.settings.first_video_id) {
        try {
          await ctx.replyWithVideo(this.settings.first_video_id, {
            caption: welcomeText,
            reply_markup: keyboard
          });
          logger.info('✅ Welcome video sent', { userId: ctx.from?.id }, 'Grammy');
          return;
        } catch (videoError) {
          logger.warn('⚠️ Failed to send video, falling back to text', { 
            error: (videoError as Error).message,
            userId: ctx.from?.id 
          }, 'Grammy');
        }
      }
      
      // Отправляем текстовое сообщение
      await ctx.reply(welcomeText, {
        reply_markup: keyboard
      });
      logger.info('✅ Welcome message sent', { userId: ctx.from?.id }, 'Grammy');
      
    } catch (error) {
      logger.error('❌ Error sending welcome message', { 
        error: (error as Error).message,
        userId: ctx.from?.id 
      }, 'Grammy');
    }
  }

  /**
   * Уведомление админа о новом пользователе
   */
  private async notifyAdminNewUser(user: any): Promise<void> {
    if (!this.settings.admin_chat_id) return;

    const message = `🆕 *Новый пользователь!*\n\n` +
      `👤 ID: ${user.id}\n` +
      `📱 Telegram ID: ${user.tg_id}\n` +
      `👋 Имя: ${user.first_name || ''} ${user.last_name || ''}\n` +
      `🔗 Username: ${user.username ? '@' + user.username : 'не указан'}\n` +
      `📅 Дата: ${new Date().toLocaleString('ru-RU')}`;

    try {
      await this.bot.api.sendMessage(this.settings.admin_chat_id, message, { parse_mode: 'Markdown' });
      logger.info('✅ New user notification sent to admin', { userId: user.id }, 'Grammy');
    } catch (error) {
      logger.error('❌ Failed to notify admin about new user', { error: (error as Error).message }, 'Grammy');
    }
  }

  /**
   * Построение информационного сообщения для админа
   */
  private buildAdminInfoMessage(): string {
    return `⚙️ *Настройки grammY бота*\n\n` +
      `🤖 Основной бот: ${this.settings.tg_main_bot || 'не указан'}\n` +
      `🔘 Кнопка каталога: ${this.settings.bot_btn_title || 'не указана'}\n` +
      `👥 Кнопка группы: ${this.settings.group_btn_title || 'не указана'}\n` +
      `🔗 Группа: ${this.settings.tg_group || 'не указана'}\n` +
      `💬 Поддержка: ${this.settings.tg_support || 'не указана'}\n` +
      `📹 Видео ID: ${this.settings.first_video_id || 'не указан'}\n\n` +
      `📊 *Метрики:*\n` +
      `- Сообщений обработано: ${this.metrics.messagesProcessed}\n` +
      `- Ошибок: ${this.metrics.errorsCount}\n` +
      `- Среднее время: ${this.metrics.averageResponseTime.toFixed(2)}ms\n` +
      `- Callback'ов: ${this.metrics.callbacksHandled}\n\n` +
      `🧪 *grammY Migration Mode Active*`;
  }

  // ========================
  // UTILITY METHODS (IMPLEMENTATIONS)
  // ========================

  /**
   * Парсинг номера заказа из текста
   */
  private parseOrderNumber(text: string): string | null {
    const match = text.match(/№(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Парсинг ФИО из текста сообщения
   */
  private parseFullName(text: string): string | null {
    const match = text.match(/ФИО:\s*(.+?)(?:\n|$)/);
    return match ? match[1].trim() : null;
  }

  /**
   * Сохранение состояния пользователя для tracking conversation
   */
  private async saveUserState(orderId: string, msgId: number, hMsgId: number, chatId: number): Promise<void> {
    const key = `user_${chatId}_state`;
    const state = {
      order_id: BigInt(orderId),
      msg_id: msgId,
      h_msg: hMsgId,
      timestamp: Date.now(),
      mode: 'tracking'
    };
    
    try {
      // Сохраняем состояние пользователя в Redis с TTL 5 минут
      await RedisService.setUserState(key, state, 300);
      logger.info('✅ User state saved for tracking', { orderId, chatId }, 'Grammy');
    } catch (error) {
      logger.warn('⚠️ Failed to save user state', { error: error.message, orderId, chatId }, 'Grammy');
    }
  }

  /**
   * Получение полного имени пользователя
   */
  private getFullName(user: any): string {
    const firstName = user.first_name || user.first_name_raw || '';
    const lastName = user.last_name || user.last_name_raw || '';
    const middleName = user.middle_name || '';
    
    return `${firstName} ${lastName} ${middleName}`.trim() || 'Не указано';
  }

  /**
   * Построение полного адреса пользователя
   */
  private buildFullAddress(user: any): string {
    const parts = [];
    
    if (user.postal_code) parts.push(`${user.postal_code}`);
    if (user.address) parts.push(user.address);
    if (user.street) parts.push(user.street);
    if (user.home) parts.push(`дом ${user.home}`);
    if (user.apartment) parts.push(`кв. ${user.apartment}`);
    if (user.build) parts.push(`корп. ${user.build}`);
    
    return parts.join(', ') || 'Адрес не указан';
  }

  // ========================
  // UTILITY METHODS
  // ========================

  private isAdmin(userId?: number): boolean {
    if (!userId) return false;
    const adminChatId = this.settings.admin_chat_id || '125861752';
    return userId.toString() === adminChatId;
  }

  private isCourier(userId?: number): boolean {
    if (!userId) return false;
    const courierId = this.settings.courier_tg_id || '7690550402';
    return userId.toString() === courierId;
  }

  private updateMetrics(duration: number, isError: boolean): void {
    this.metrics.messagesProcessed++;
    
    if (isError) {
      this.metrics.errorsCount++;
    }

    // Обновляем среднее время ответа
    const totalDuration = this.metrics.averageResponseTime * (this.metrics.messagesProcessed - 1) + duration;
    this.metrics.averageResponseTime = totalDuration / this.metrics.messagesProcessed;
  }

  // ========================
  // PUBLIC API
  // ========================

  /**
   * Получение webhook callback для интеграции с Next.js
   */
  getWebhookCallback() {
    if (!this.bot) {
      throw new Error('Bot not initialized');
    }
    
    return webhookCallback(this.bot, 'next-js');
  }

  /**
   * Обработка update от Telegram webhook
   */
  async handleUpdate(update: any): Promise<void> {
    if (!this.isInitialized || !this.bot) {
      throw new Error('Bot not initialized! Either call `await bot.init()`, or directly set the `botInfo` option in the `Bot` constructor to specify a known bot info object.');
    }

    try {
      logger.info('📨 Processing Telegram update', { 
        updateId: update.update_id,
        updateType: Object.keys(update).filter(key => key !== 'update_id')[0]
      }, 'Grammy');

      // Обрабатываем update через grammY bot
      await this.bot.handleUpdate(update);
      
      // Увеличиваем счетчик обработанных сообщений
      this.metrics.messagesProcessed++;

      logger.info('✅ Update processed successfully', { 
        updateId: update.update_id 
      }, 'Grammy');

    } catch (error) {
      this.metrics.errorsCount++;
      
      logger.error('❌ Failed to process update', { 
        error: (error as Error).message,
        updateId: update.update_id,
        stack: (error as Error).stack
      }, 'Grammy');
      
      throw error;
    }
  }

  /**
   * Получение метрик производительности
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Получение настроек бота
   */
  public getSettings(): BotSettings {
    return { ...this.settings };
  }

  /**
   * Проверка статуса инициализации
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Получение информации о боте
   */
  public async getBotInfo() {
    if (!this.isInitialized) {
      throw new Error('Bot not initialized');
    }
    return await this.bot.api.getMe();
  }

  /**
   * Настройка webhook'а
   */
  public async setWebhook(url: string, secretToken?: string) {
    if (!this.isInitialized) {
      throw new Error('Bot not initialized');
    }
    
    return await this.bot.api.setWebhook(url, {
      allowed_updates: ['message', 'callback_query'],
      secret_token: secretToken
    });
  }

  /**
   * Получение информации о webhook'е
   */
  public async getWebhookInfo() {
    if (!this.isInitialized) {
      throw new Error('Bot not initialized');
    }
    
    return await this.bot.api.getWebhookInfo();
  }

  /**
   * Удаление webhook'а
   */
  public async deleteWebhook() {
    if (!this.isInitialized) {
      throw new Error('Bot not initialized');
    }
    
    return await this.bot.api.deleteWebhook();
  }

  /**
   * Сброс метрик
   */
  public resetMetrics(): void {
    this.metrics = {
      messagesProcessed: 0,
      errorsCount: 0,
      averageResponseTime: 0,
      callbacksHandled: 0,
      conversationsStarted: 0,
      webhookRequestsReceived: 0,
      lastResetTime: new Date()
    };
  }
}