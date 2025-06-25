import { PrismaClient } from '@prisma/client';
import { RedisService } from './redis.service';

const prisma = new PrismaClient();

/**
 * Сервис для работы с настройками ботов из таблицы settings
 * Поддерживает кэширование через Redis для быстрого доступа
 */
export class SettingsService {
  private static cache = new Map<string, string>();
  private static lastCacheUpdate = 0;
  private static cacheExpiry = 5 * 60 * 1000; // 5 минут

  /**
   * Получить значение настройки
   */
  static async get(variable: string, defaultValue?: string): Promise<string | null> {
    try {
      // Проверяем кэш в Redis
      if (RedisService.isAvailable()) {
        const cachedValue = await RedisService.getCache<string>(`setting:${variable}`);
        if (cachedValue !== null) {
          return cachedValue;
        }
      }

      // Проверяем локальный кэш
      if (this.cache.has(variable) && Date.now() - this.lastCacheUpdate < this.cacheExpiry) {
        return this.cache.get(variable) || defaultValue || null;
      }

      // Получаем из базы данных
      const setting = await prisma.settings.findUnique({
        where: { variable }
      });

      const value = setting?.value || defaultValue || null;

      // Кэшируем значение
      if (value !== null) {
        this.cache.set(variable, value);
        if (RedisService.isAvailable()) {
          await RedisService.setCache(`setting:${variable}`, value, 300); // 5 минут TTL
        }
      }

      return value;
    } catch (error) {
      console.error(`❌ Error getting setting ${variable}:`, error);
      return defaultValue || null;
    }
  }

  /**
   * Установить значение настройки
   */
  static async set(variable: string, value: string, description?: string): Promise<boolean> {
    try {
      await prisma.settings.upsert({
        where: { variable },
        update: { 
          value, 
          updated_at: new Date(),
          ...(description && { description })
        },
        create: { 
          variable, 
          value, 
          description: description || `Настройка ${variable}`,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Обновляем кэши
      this.cache.set(variable, value);
      if (RedisService.isAvailable()) {
        await RedisService.setCache(`setting:${variable}`, value, 300);
      }

      return true;
    } catch (error) {
      console.error(`❌ Error setting ${variable}:`, error);
      return false;
    }
  }

  /**
   * Получить boolean настройку
   */
  static async getBoolean(variable: string, defaultValue: boolean = false): Promise<boolean> {
    const value = await this.get(variable, defaultValue.toString());
    return value === 'true' || value === '1';
  }

  /**
   * Получить числовую настройку
   */
  static async getNumber(variable: string, defaultValue: number = 0): Promise<number> {
    const value = await this.get(variable, defaultValue.toString());
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Очистить кэш настроек
   */
  static async clearCache(): Promise<void> {
    this.cache.clear();
    this.lastCacheUpdate = 0;
    
    if (RedisService.isAvailable()) {
      const redis = await RedisService.getInstance();
      if (redis) {
        const keys = await redis.keys('setting:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      }
    }
  }

  /**
   * Получить все настройки ботов одним запросом
   */
  static async getBotSettings() {
    const settings = {
      // Токены ботов
      client_bot_token: await this.get('client_bot_token', process.env.WEBAPP_TELEGRAM_BOT_TOKEN),
      admin_bot_token: await this.get('admin_bot_token', process.env.TELESKLAD_BOT_TOKEN),
      
      // ID пользователей
      admin_chat_id: await this.get('admin_chat_id', '125861752'),
      courier_tg_id: await this.get('courier_tg_id', '7690550402'),
      
      // Настройки webhook
      webhook_url: await this.get('webhook_url'),
      webhook_secret: await this.get('webhook_secret'),
      webhook_max_connections: await this.getNumber('webhook_max_connections', 40),
      
      // Настройки Grammy
      grammy_enabled: await this.getBoolean('grammy_enabled', true),
      grammy_webhook_endpoint: await this.get('grammy_webhook_endpoint', '/api/telegram/grammy-simple/webhook'),
      grammy_rate_limit: await this.getNumber('grammy_rate_limit', 30),
      grammy_timeout: await this.getNumber('grammy_timeout', 5000),
      
      // Настройки уведомлений
      notifications_enabled: await this.getBoolean('notifications_enabled', true),
      admin_notifications: await this.getBoolean('admin_notifications', true),
      courier_notifications: await this.getBoolean('courier_notifications', true),
      client_notifications: await this.getBoolean('client_notifications', true),
      
      // Настройки доставки
      delivery_cost: await this.getNumber('delivery_cost', 500),
      free_delivery_threshold: await this.getNumber('free_delivery_threshold', 5000),
      
      // Медиа контент
      first_video_id: await this.get('first_video_id'),
      
      // Шаблоны сообщений (с fallback на существующие в settings)
      welcome_message: await this.get('preview_msg', 'Добро пожаловать!'),
      order_created_message: await this.get('tg_msg_unpaid_msg', '🎉 Ваш заказ принят.'),
      order_unpaid_main_message: await this.get('tg_msg_unpaid_main', 'Проверьте заказ перед оплатой:'),
      payment_processing_message: await this.get('tg_msg_paid_client', 'Идет проверка оплаты...'),
      payment_received_message: await this.get('tg_msg_on_processing_client', 'Благодарим за покупку!'),
      order_shipped_message: await this.get('tg_msg_on_shipped_courier', 'Заказ отправлен!'),
      order_cancelled_message: await this.get('tg_msg_cancel', 'Заказ отменён.'),
      track_number_saved_message: await this.get('tg_msg_track_num_save', 'Трек-номер сохранен.'),
      unpaid_reminder_message: await this.get('tg_msg_unpaid_reminder_one', 'Напоминание об оплате'),
      approved_pay_message: await this.get('tg_msg_approved_pay', 'Платеж подтвержден'),
      courier_processing_message: await this.get('tg_msg_on_processing_courier', 'Нужно отправить заказ'),
      admin_payment_check_message: await this.get('tg_msg_paid_admin', 'Проверьте оплату'),
      
      // Настройки кнопок
      bot_btn_title: await this.get('bot_btn_title', '🛒 Каталог'),
      group_btn_title: await this.get('group_btn_title', '💬 Чат поддержки'),
      support_btn_title: await this.get('support_btn_title', '❓ Задать вопрос'),
      
      // Ссылки
      tg_group: await this.get('tg_group'),
      tg_support: await this.get('tg_support'),
      webapp_url: await this.get('webapp_url', process.env.WEBAPP_URL),
      
      // Дополнительные сообщения для заказов
      tg_msg_unpaid_main: await this.get('tg_msg_unpaid_main'),
      tg_msg_paid_client: await this.get('tg_msg_paid_client'),
      tg_msg_paid_admin: await this.get('tg_msg_paid_admin'),
      tg_msg_on_processing_client: await this.get('tg_msg_on_processing_client'),
      tg_msg_on_processing_courier: await this.get('tg_msg_on_processing_courier'),
      tg_msg_set_track_num: await this.get('tg_msg_set_track_num'),
      tg_msg_on_shipped_client: await this.get('tg_msg_on_shipped_courier'),
      
      // Дополнительные настройки
      maintenance_mode: await this.getBoolean('maintenance_mode', false),
      maintenance_message: await this.get('maintenance_message', 'Бот временно недоступен.'),
      debug_mode: await this.getBoolean('debug_mode', false),
      log_level: await this.get('log_level', 'info'),
      environment: await this.get('environment', 'development')
    };

    return settings;
  }

  /**
   * Проверить готовность Grammy к работе
   */
  static async isGrammyReady(): Promise<boolean> {
    try {
      const settings = await this.getBotSettings();
      
      const hasTokens = !!(settings.client_bot_token && settings.admin_bot_token);
      const grammyEnabled = settings.grammy_enabled;
      const hasWebhook = !!settings.webhook_url;
      
      return hasTokens && grammyEnabled && hasWebhook;
    } catch (error) {
      console.error('❌ Error checking Grammy readiness:', error);
      return false;
    }
  }

  /**
   * Получить конфигурацию для Grammy
   */
  static async getGrammyConfig() {
    const settings = await this.getBotSettings();
    
    return {
      clientBotToken: settings.client_bot_token!,
      adminBotToken: settings.admin_bot_token!,
      webhookUrl: settings.webhook_url,
      webhookEndpoint: settings.grammy_webhook_endpoint,
      rateLimit: settings.grammy_rate_limit,
      timeout: settings.grammy_timeout,
      enabled: settings.grammy_enabled,
      adminChatId: settings.admin_chat_id,
      courierTgId: settings.courier_tg_id
    };
  }

  /**
   * Массовое обновление настроек
   */
  static async bulkUpdate(updates: Record<string, string>): Promise<boolean> {
    try {
      for (const [variable, value] of Object.entries(updates)) {
        await this.set(variable, value);
      }
      
      // Очищаем кэш после массового обновления
      await this.clearCache();
      
      return true;
    } catch (error) {
      console.error('❌ Error bulk updating settings:', error);
      return false;
    }
  }
}

export default SettingsService; 