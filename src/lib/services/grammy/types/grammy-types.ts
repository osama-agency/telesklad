import { Context, Bot, InlineKeyboard } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';

/**
 * Расширенный контекст для grammY с дополнительными свойствами
 */
export interface ExtendedContext extends Context, ConversationFlavor {
  // Пользователь из базы данных (добавляется через middleware)
  user?: {
    id: number;
    tg_id: bigint;
    first_name?: string;
    last_name?: string;
    username?: string;
    email: string;
    created_at: Date;
    updated_at: Date;
    isNew?: boolean; // Флаг нового пользователя
  };

  // Дополнительная информация о сообщении
  messageInfo?: {
    isFromAdmin: boolean;
    isFromCourier: boolean;
    processingStartTime: number;
  };

  // Метрики для мониторинга
  metrics?: {
    startTime: number;
    processingDuration?: number;
  };
}

/**
 * Типизированные данные для callback queries
 */
export type CallbackData = 
  | { type: 'i_paid'; orderId: string }
  | { type: 'approve_payment'; orderId: string }
  | { type: 'submit_tracking'; orderId: string }
  | { type: 'track_back'; orderId: string }
  | { type: 'resend_tracking'; orderId: string }
  | { type: 'track_package'; orderId: string; trackingNumber: string }
  | { type: 'support' }
  | { type: 'test_callback' };

/**
 * Контекст для callback queries с типизированными данными
 */
export interface CallbackContext extends ExtendedContext {
  callbackQuery: NonNullable<Context['callbackQuery']> & {
    data: string;
  };
  
  // Парсированные данные callback'а
  callbackData?: CallbackData;
}

/**
 * Контекст для conversations (диалогов)
 */
export type ConversationContext = ExtendedContext & {
  conversation: Conversation<ExtendedContext>;
};

/**
 * Настройки бота (аналог старого BotSettings)
 */
export interface BotSettings {
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
 * Опции для отправки сообщений
 */
export interface MessageOptions {
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disableWebPagePreview?: boolean;
  disableNotification?: boolean;
  replyToMessageId?: number;
  keyboard?: InlineKeyboard;
  markup?: InlineKeyboard; // Альтернативное название для совместимости
}

/**
 * Результат обработки сообщения
 */
export interface MessageResult {
  success: boolean;
  messageId?: number;
  error?: string;
  processingTime?: number;
}

/**
 * Метрики производительности
 */
export interface PerformanceMetrics {
  messagesProcessed: number;
  errorsCount: number;
  averageResponseTime: number;
  callbacksHandled: number;
  conversationsStarted: number;
  webhookRequestsReceived: number;
  lastResetTime: Date;
}

/**
 * Конфигурация для rate limiting
 */
export interface RateLimitConfig {
  timeFrame: number; // в миллисекундах
  limit: number; // количество запросов
  keyGenerator?: (ctx: ExtendedContext) => string;
  onLimitExceeded?: (ctx: ExtendedContext) => Promise<void>;
}

/**
 * Типы команд бота
 */
export type BotCommand = 
  | 'start'
  | 'admin'
  | 'settings'
  | 'test'
  | 'help'
  | 'status';

/**
 * Типы обработчиков сообщений
 */
export type MessageType = 
  | 'text'
  | 'video'
  | 'photo'
  | 'document'
  | 'audio'
  | 'voice'
  | 'sticker'
  | 'contact'
  | 'location';

/**
 * Статусы заказа для типизированной обработки
 */
export type OrderStatus = 
  | 'unpaid'    // 0
  | 'paid'      // 1
  | 'processing'// 2
  | 'shipped'   // 3
  | 'delivered' // 4
  | 'cancelled';// 5

/**
 * Данные заказа для обработки в боте
 */
export interface OrderData {
  id: string | number;
  status: OrderStatus;
  total_amount: number;
  delivery_cost: number;
  tracking_number?: string;
  user: {
    id: number;
    tg_id: bigint;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
  };
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
}

/**
 * Конфигурация webhook'а
 */
export interface WebhookConfig {
  url: string;
  secretToken?: string;
  allowedUpdates: string[];
  maxConnections?: number;
  dropPendingUpdates?: boolean;
}

/**
 * Результат настройки webhook'а
 */
export interface WebhookSetupResult {
  success: boolean;
  webhookUrl?: string;
  webhookInfo?: any;
  error?: string;
  botType?: 'webapp' | 'main' | 'test';
}

/**
 * Логи для мониторинга
 */
export interface BotLogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: {
    userId?: number;
    chatId?: number;
    updateType?: string;
    command?: string;
    callbackData?: string;
    error?: string;
    duration?: number;
  };
  source: 'Grammy' | 'Legacy';
}

/**
 * Состояние пользователя для conversations
 */
export interface UserState {
  stage?: string;
  data?: Record<string, any>;
  orderId?: string;
  messageIds?: number[];
  timestamp: number;
  ttl?: number; // Time to live в секундах
}

/**
 * Middleware функция для grammY
 */
export type MiddlewareFunction = (ctx: ExtendedContext, next: () => Promise<void>) => Promise<void>;

/**
 * Опции для создания inline клавиатуры
 */
export interface KeyboardOptions {
  orderId?: string;
  trackingNumber?: string;
  includeBackButton?: boolean;
  includeAdminButtons?: boolean;
  webappUrl?: string;
}

/**
 * Тип для обработчиков команд
 */
export type CommandHandler = (ctx: ExtendedContext) => Promise<void>;

/**
 * Тип для обработчиков callback'ов
 */
export type CallbackHandler = (ctx: CallbackContext) => Promise<void>;

/**
 * Тип для обработчиков сообщений
 */
export type MessageHandler = (ctx: ExtendedContext) => Promise<void>;

/**
 * Конфигурация conversation'а
 */
export interface ConversationConfig {
  id: string;
  handler: (conversation: Conversation<ExtendedContext>, ctx: ExtendedContext) => Promise<void>;
  maxDuration?: number; // в миллисекундах
  onTimeout?: (ctx: ExtendedContext) => Promise<void>;
}

export { Bot, Context, InlineKeyboard, Conversation };