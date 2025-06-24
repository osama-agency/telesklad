import { RedisService } from './redis.service';
import { NotificationExecutorService } from './notification-executor.service';

/**
 * Redis Queue Worker для обработки уведомлений и фоновых задач
 */
export class RedisQueueService {
  private static isRunning = false;
  private static pollingInterval = 5000; // 5 секунд

  /**
   * Запуск обработчика очереди
   */
  static async startWorker(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Queue worker already running');
      return;
    }

    if (!RedisService.isAvailable()) {
      console.log('⚠️ Redis not available, queue worker disabled');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Redis Queue Worker');

    // Запускаем обработку в фоне
    this.processQueue();
  }

  /**
   * Остановка обработчика очереди
   */
  static stopWorker(): void {
    this.isRunning = false;
    console.log('⏹️ Stopping Redis Queue Worker');
  }

  /**
   * Основной цикл обработки очереди
   */
  private static async processQueue(): Promise<void> {
    while (this.isRunning) {
      try {
        // Обрабатываем уведомления
        await this.processNotificationQueue();
        
        // Обрабатываем аналитику
        await this.processAnalyticsQueue();
        
      } catch (error) {
        console.error('❌ Queue processing error:', error);
      }

      // Ждем перед следующей итерацией
      await this.sleep(this.pollingInterval);
    }
  }

  /**
   * Обработка очереди уведомлений
   */
  private static async processNotificationQueue(): Promise<void> {
    try {
      const jobs = await RedisService.getQueueJobs('notifications', 10);
      
      for (const job of jobs) {
        try {
          console.log(`📨 Processing notification job: ${job.id}`);
          
          // Обрабатываем уведомление
          await this.handleNotificationJob(job);
          
          // Удаляем задачу из очереди
          await RedisService.removeFromQueue('notifications', job);
          
          console.log(`✅ Notification job ${job.id} completed`);
          
        } catch (error) {
          console.error(`❌ Failed to process notification job ${job.id}:`, error);
          
          // Увеличиваем счетчик попыток
          job.retryCount = (job.retryCount || 0) + 1;
          
          // Если превышен лимит попыток, удаляем задачу
          if (job.retryCount >= 3) {
            await RedisService.removeFromQueue('notifications', job);
            console.log(`❌ Notification job ${job.id} failed after 3 attempts`);
          } else {
            // Возвращаем в очередь с задержкой
            await RedisService.removeFromQueue('notifications', job);
            await RedisService.addToQueue('notifications', job.data, 60 * job.retryCount);
            console.log(`🔄 Notification job ${job.id} rescheduled, attempt ${job.retryCount}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error processing notification queue:', error);
    }
  }

  /**
   * Обработка задачи уведомления
   */
  private static async handleNotificationJob(job: any): Promise<void> {
    const { type, data } = job.data;
    
    switch (type) {
      case 'payment_reminder':
        await this.handlePaymentReminder(data);
        break;
        
      case 'bonus_notification':
        await this.handleBonusNotification(data);
        break;
        
      case 'restock_notification':
        await this.handleRestockNotification(data);
        break;
        
      case 'order_status_update':
        await this.handleOrderStatusUpdate(data);
        break;
        
      case 'order_status_change':
        await this.handleOrderStatusChange(data);
        break;
        
      default:
        console.warn(`⚠️ Unknown notification type: ${type}`);
    }
  }

  /**
   * Обработка напоминания об оплате
   */
  private static async handlePaymentReminder(data: any): Promise<void> {
    const { orderId, reminderType } = data;
    
    // Имитируем структуру как в оригинальном сервисе
    const jobData = {
      order_id: orderId,
      reminder_type: reminderType
    };
    
    await NotificationExecutorService.executePaymentReminder(Date.now(), jobData);
  }

  /**
   * Обработка уведомления о бонусах
   */
  private static async handleBonusNotification(data: any): Promise<void> {
    const { orderId, bonusAmount } = data;
    
    const jobData = {
      order_id: orderId,
      bonus_amount: bonusAmount
    };
    
    await NotificationExecutorService.executeBonusNotification(Date.now(), jobData);
  }

  /**
   * Обработка уведомления о поступлении товара
   */
  private static async handleRestockNotification(data: any): Promise<void> {
    const { productId, userId } = data;
    
    const jobData = {
      product_id: productId,
      user_id: userId
    };
    
    await NotificationExecutorService.executeRestockNotification(Date.now(), jobData);
  }

  /**
   * Обработка обновления статуса заказа
   */
  private static async handleOrderStatusUpdate(data: any): Promise<void> {
    const { orderId, status, userId } = data;
    
    // Инкрементируем активность пользователя
    if (userId) {
      await RedisService.increment(`activity:${new Date().toISOString().split('T')[0]}:${userId}`, 86400);
    }
    
    console.log(`📋 Order ${orderId} status updated to ${status}`);
  }

  /**
   * ИСПРАВЛЕНО: Обработка изменения статуса заказа через ReportService
   */
  private static async handleOrderStatusChange(data: any): Promise<void> {
    try {
      const { order, previousStatus } = data;
      
      console.log(`📋 Processing order status change: ${order.id} (${previousStatus} -> ${order.status})`);
      
      // Импортируем ReportService динамически для избежания циклических зависимостей
      const { ReportService } = await import('./ReportService');
      
      // Вызываем ReportService.handleOrderStatusChange
      await ReportService.handleOrderStatusChange(order, previousStatus);
      
      console.log(`✅ Order status change processed for order ${order.id}`);
      
    } catch (error) {
      console.error('❌ Error handling order status change:', error);
      throw error;
    }
  }

  /**
   * Обработка аналитики
   */
  private static async processAnalyticsQueue(): Promise<void> {
    try {
      const jobs = await RedisService.getQueueJobs('analytics', 3);
      
      for (const job of jobs) {
        try {
          console.log(`📊 Processing analytics job: ${job.id}`);
          
          await this.handleAnalyticsJob(job);
          
          await RedisService.removeFromQueue('analytics', job);
          
        } catch (error) {
          console.error(`❌ Failed to process analytics job ${job.id}:`, error);
          await RedisService.removeFromQueue('analytics', job);
        }
      }
    } catch (error) {
      console.error('❌ Error processing analytics queue:', error);
    }
  }

  /**
   * Обработка аналитической задачи
   */
  private static async handleAnalyticsJob(job: any): Promise<void> {
    const { type, data } = job.data;
    
    switch (type) {
      case 'user_activity':
        const today = new Date().toISOString().split('T')[0];
        await RedisService.increment(`activity:${today}:${data.userId}`, 86400);
        break;
        
      case 'product_view':
        await RedisService.increment(`product_views:${data.productId}`, 86400);
        break;
        
      case 'order_created':
        await RedisService.increment('orders_today', 86400);
        break;
        
      default:
        console.warn(`⚠️ Unknown analytics job type: ${type}`);
    }
  }

  // === ПУБЛИЧНЫЕ МЕТОДЫ ===

  /**
   * Добавить уведомление в очередь
   */
  static async addNotification(type: string, data: any, delay: number = 0): Promise<boolean> {
    return await RedisService.addToQueue('notifications', { type, data }, delay);
  }

  /**
   * Добавить аналитическую задачу в очередь
   */
  static async addAnalyticsJob(type: string, data: any, delay: number = 0): Promise<boolean> {
    return await RedisService.addToQueue('analytics', { type, data }, delay);
  }

  /**
   * Получить статистику очередей
   */
  static async getQueueStats(): Promise<{
    notifications: number;
    analytics: number;
    redis: { status: string; latency?: number; error?: string };
  }> {
    try {
      const redis = await RedisService.getInstance();
      if (!redis) {
        return {
          notifications: 0,
          analytics: 0,
          redis: { status: 'unavailable' }
        };
      }

      const [notifications, analytics, redisHealth] = await Promise.all([
        redis.zcard('queue:notifications'),
        redis.zcard('queue:analytics'),
        RedisService.healthCheck()
      ]);

      return {
        notifications,
        analytics,
        redis: redisHealth
      };
    } catch (error) {
      console.error('❌ Error getting queue stats:', error);
      return {
        notifications: 0,
        analytics: 0,
        redis: { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Приостановка выполнения
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Проверка состояния воркера
   */
  static isWorkerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Очистка всех очередей
   */
  static async clearAllQueues(): Promise<void> {
    try {
      const redis = await RedisService.getInstance();
      if (!redis) return;

      await Promise.all([
        redis.del('queue:notifications'),
        redis.del('queue:analytics')
      ]);

      console.log('🧹 All queues cleared');
    } catch (error) {
      console.error('❌ Error clearing queues:', error);
    }
  }

  /**
   * Добавить задачу уведомления в очередь (упрощенный метод)
   */
  static async addNotificationJob(type: string, data: any): Promise<void> {
    await this.addNotification(type, data);
  }
} 