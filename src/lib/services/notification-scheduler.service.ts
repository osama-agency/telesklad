import { prisma } from '@/libs/prismaDb';

export class NotificationSchedulerService {
  
  // Получение настроек уведомлений из базы данных
  static async getNotificationSettings() {
    try {
      const settings = await prisma.settings.findMany({
        where: {
          variable: {
            in: [
              'notification_payment_reminder_first_hours',
              'notification_payment_reminder_final_hours', 
              'notification_payment_auto_cancel_hours',
              'notification_review_request_days'
            ]
          }
        }
      });

      const settingsMap = settings.reduce((acc: Record<string, number>, setting: any) => {
        if (setting.variable) {
          acc[setting.variable] = parseInt(setting.value || '0') || 0;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        payment_reminder_first_hours: settingsMap.notification_payment_reminder_first_hours || 48,
        payment_reminder_final_hours: settingsMap.notification_payment_reminder_final_hours || 51,
        payment_auto_cancel_hours: settingsMap.notification_payment_auto_cancel_hours || 72,
        review_request_days: settingsMap.notification_review_request_days || 10
      };
    } catch (error) {
      console.error('❌ Error getting notification settings, using defaults:', error);
      return {
        payment_reminder_first_hours: 48,
        payment_reminder_final_hours: 51,
        payment_auto_cancel_hours: 72,
        review_request_days: 10
      };
    }
  }
  
  // Планирование напоминания о неоплаченном заказе
  static async schedulePaymentReminder(orderId: number, userId: number) {
    try {
      const now = new Date();
      const settings = await this.getNotificationSettings();
      
      console.log(`📅 Scheduling payment reminders for order ${orderId}, user ${userId}`);
      console.log(`⚙️ Using settings: first=${settings.payment_reminder_first_hours}h, final=${settings.payment_reminder_final_hours}h, cancel=${settings.payment_auto_cancel_hours}h`);
      
      // Первое напоминание
      await (prisma as any).notification_jobs.create({
        data: {
          job_type: 'payment_reminder_first',
          target_id: BigInt(orderId),
          user_id: BigInt(userId),
          scheduled_at: new Date(now.getTime() + settings.payment_reminder_first_hours * 60 * 60 * 1000),
          data: { 
            reminder_type: 'first', 
            order_id: orderId,
            created_at: now.toISOString()
          }
        }
      });

      // Финальное напоминание
      await (prisma as any).notification_jobs.create({
        data: {
          job_type: 'payment_reminder_final',
          target_id: BigInt(orderId),
          user_id: BigInt(userId),
          scheduled_at: new Date(now.getTime() + settings.payment_reminder_final_hours * 60 * 60 * 1000),
          data: { 
            reminder_type: 'final', 
            order_id: orderId,
            created_at: now.toISOString()
          }
        }
      });

      // Отмена заказа
      await (prisma as any).notification_jobs.create({
        data: {
          job_type: 'payment_reminder_cancel',
          target_id: BigInt(orderId),
          user_id: BigInt(userId),
          scheduled_at: new Date(now.getTime() + settings.payment_auto_cancel_hours * 60 * 60 * 1000),
          data: { 
            reminder_type: 'cancel', 
            order_id: orderId,
            created_at: now.toISOString()
          }
        }
      });

      console.log(`✅ Payment reminders scheduled for order ${orderId}`);
      
    } catch (error) {
      console.error('❌ Error scheduling payment reminders:', error);
      throw error;
    }
  }

  // Планирование уведомления о бонусах
  static async scheduleBonusNotification(userId: number, bonusAmount: number, orderId: number) {
    try {
      const now = new Date();
      
      console.log(`📅 Scheduling bonus notification for user ${userId}, amount: ${bonusAmount}`);
      
      await (prisma as any).notification_jobs.create({
        data: {
          job_type: 'bonus_notice',
          target_id: BigInt(orderId),
          user_id: BigInt(userId),
          scheduled_at: new Date(now.getTime() + 30 * 1000), // через 30 секунд
          data: { 
            bonus_amount: bonusAmount, 
            order_id: orderId,
            created_at: now.toISOString()
          }
        }
      });

      console.log(`✅ Bonus notification scheduled for user ${userId}`);
      
    } catch (error) {
      console.error('❌ Error scheduling bonus notification:', error);
      throw error;
    }
  }

  // Планирование уведомления о поступлении товара
  static async scheduleRestockNotification(productId: number) {
    try {
      console.log(`📅 Scheduling restock notifications for product ${productId}`);
      
      // Получаем всех подписчиков товара
      const subscriptions = await prisma.product_subscriptions.findMany({
        where: { product_id: BigInt(productId) },
        include: { users: true }
      });

      if (subscriptions.length === 0) {
        console.log(`ℹ️ No subscribers found for product ${productId}`);
        return;
      }

      const now = new Date();
      
      for (const subscription of subscriptions) {
        await (prisma as any).notification_jobs.create({
          data: {
            job_type: 'restock_notice',
            target_id: BigInt(productId),
            user_id: subscription.user_id,
            scheduled_at: new Date(now.getTime() + 10 * 1000), // через 10 секунд
            data: { 
              product_id: productId,
              created_at: now.toISOString()
            }
          }
        });
      }

      console.log(`✅ Restock notifications scheduled for ${subscriptions.length} subscribers`);
      
    } catch (error) {
      console.error('❌ Error scheduling restock notifications:', error);
      throw error;
    }
  }

  // Отмена напоминаний о заказе (когда заказ оплачен)
  static async cancelPaymentReminders(orderId: number) {
    try {
      console.log(`🚫 Cancelling payment reminders for order ${orderId}`);
      
      const result = await (prisma as any).notification_jobs.updateMany({
        where: {
          target_id: BigInt(orderId),
          job_type: {
            in: ['payment_reminder_first', 'payment_reminder_final', 'payment_reminder_cancel']
          },
          status: 'pending'
        },
        data: {
          status: 'cancelled',
          executed_at: new Date()
        }
      });

      console.log(`✅ Cancelled ${result.count} payment reminder jobs for order ${orderId}`);
      
    } catch (error) {
      console.error('❌ Error cancelling payment reminders:', error);
      throw error;
    }
  }

  // Планирование уведомления о повышении уровня аккаунта
  static async scheduleAccountTierNotification(userId: number, tierName: string, bonusPercentage: number) {
    try {
      const now = new Date();
      
      console.log(`📅 Scheduling account tier notification for user ${userId}`);
      
      await (prisma as any).notification_jobs.create({
        data: {
          job_type: 'account_tier_notice',
          target_id: BigInt(userId), // для этого типа target_id = user_id
          user_id: BigInt(userId),
          scheduled_at: new Date(now.getTime() + 30 * 1000), // через 30 секунд
          data: { 
            tier_name: tierName,
            bonus_percentage: bonusPercentage,
            created_at: now.toISOString()
          }
        }
      });

      console.log(`✅ Account tier notification scheduled for user ${userId}`);
      
    } catch (error) {
      console.error('❌ Error scheduling account tier notification:', error);
      throw error;
    }
  }

  // Получение статистики по задачам
  static async getJobsStats() {
    try {
      const stats = await (prisma as any).notification_jobs.groupBy({
        by: ['status', 'job_type'],
        _count: true
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting jobs stats:', error);
      throw error;
    }
  }

  // Очистка старых выполненных задач (старше 7 дней)
  static async cleanupOldJobs() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const result = await (prisma as any).notification_jobs.deleteMany({
        where: {
          status: {
            in: ['executed', 'failed', 'cancelled']
          },
          executed_at: {
            lt: sevenDaysAgo
          }
        }
      });

      console.log(`🧹 Cleaned up ${result.count} old notification jobs`);
      return result.count;
      
    } catch (error) {
      console.error('❌ Error cleaning up old jobs:', error);
      throw error;
    }
  }
} 