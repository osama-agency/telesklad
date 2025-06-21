import * as cron from 'node-cron';
import { prisma } from '@/libs/prismaDb';
import { NotificationExecutorService } from '../services/notification-executor.service';
import { NotificationSchedulerService } from '../services/notification-scheduler.service';
import { TelegramTokenService } from '../services/telegram-token.service';

export class NotificationCronService {

  // Инициализация всех CRON задач
  static initializeNotificationCron() {
    console.log('🚀 Initializing notification CRON jobs...');

    // Каждую минуту проверяем готовые к выполнению задачи
    cron.schedule('* * * * *', async () => {
      await this.processScheduledJobs();
    });

    // Каждый час очищаем старые задачи
    cron.schedule('0 * * * *', async () => {
      await this.cleanupOldJobs();
    });

    // Каждый день в 10:00 отправляем статистику админу
    cron.schedule('0 10 * * *', async () => {
      await this.sendDailyStats();
    });

    console.log('✅ Notification CRON jobs initialized');
  }

  // Обработка запланированных задач
  private static async processScheduledJobs() {
    try {
      const now = new Date();
      
      // Получаем все задачи, готовые к выполнению
      const readyJobs = await (prisma as any).notification_jobs.findMany({
        where: {
          status: 'pending',
          scheduled_at: {
            lte: now
          }
        },
        orderBy: {
          scheduled_at: 'asc'
        },
        take: 10 // Обрабатываем максимум 10 задач за раз
      });

      if (readyJobs.length === 0) {
        return; // Нет задач для выполнения
      }

      console.log(`📋 Found ${readyJobs.length} ready jobs to process`);

      // Выполняем задачи параллельно
      const promises = readyJobs.map((job: any) => 
        this.processJob(job).catch((error: any) => {
          console.error(`❌ Error processing job ${job.id}:`, error);
        })
      );

      await Promise.allSettled(promises);
      
    } catch (error) {
      console.error('❌ Error in processScheduledJobs:', error);
    }
  }

  // Обработка одной задачи
  private static async processJob(job: any) {
    try {
      console.log(`🔄 Processing job ${job.id} (${job.job_type})`);
      
      await NotificationExecutorService.executeJob(job);
      
    } catch (error) {
      console.error(`❌ Failed to process job ${job.id}:`, error);
      
      // Если задача упала 3 раза, помечаем как окончательно неудачную
      if (job.retry_count >= 2) {
        await (prisma as any).notification_jobs.update({
          where: { id: job.id },
          data: { 
            status: 'failed',
            executed_at: new Date()
          }
        });
        console.log(`💀 Job ${job.id} marked as permanently failed after 3 attempts`);
      } else {
        // Планируем повторную попытку через 5 минут
        await (prisma as any).notification_jobs.update({
          where: { id: job.id },
          data: { 
            status: 'pending',
            scheduled_at: new Date(Date.now() + 5 * 60 * 1000), // +5 минут
            retry_count: { increment: 1 }
          }
        });
        console.log(`🔄 Job ${job.id} rescheduled for retry in 5 minutes`);
      }
    }
  }

  // Очистка старых задач
  private static async cleanupOldJobs() {
    try {
      console.log('🧹 Running cleanup of old notification jobs...');
      
      const cleanedCount = await NotificationSchedulerService.cleanupOldJobs();
      
      if (cleanedCount > 0) {
        console.log(`✅ Cleaned up ${cleanedCount} old jobs`);
      }
      
    } catch (error) {
      console.error('❌ Error in cleanupOldJobs:', error);
    }
  }

  // Отправка ежедневной статистики
  private static async sendDailyStats() {
    try {
      console.log('📊 Sending daily notification stats...');
      
      const stats = await NotificationSchedulerService.getJobsStats();
      
      // Группируем статистику
      const summary = {
        total: 0,
        pending: 0,
        executed: 0,
        failed: 0,
        cancelled: 0,
        byType: {} as Record<string, number>
      };

      stats.forEach((stat: any) => {
        summary.total += stat._count;
        summary[stat.status as keyof typeof summary] += stat._count;
        summary.byType[stat.job_type] = (summary.byType[stat.job_type] || 0) + stat._count;
      });

      const message = `📊 Статистика уведомлений за сутки:

📈 Всего задач: ${summary.total}
⏳ Ожидают: ${summary.pending}
✅ Выполнено: ${summary.executed}
❌ Ошибок: ${summary.failed}
🚫 Отменено: ${summary.cancelled}

📋 По типам:
${Object.entries(summary.byType).map(([type, count]) => `• ${type}: ${count}`).join('\n')}

🕐 ${new Date().toLocaleString('ru-RU')}`;

      // Отправляем админу (можно настроить ID админа)
      const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
      if (adminTelegramId) {
        await this.sendTelegramMessage(adminTelegramId, message);
      }
      
    } catch (error) {
      console.error('❌ Error in sendDailyStats:', error);
    }
  }

  // Получение токена webapp бота из централизованного сервиса
  private static async getWebappBotToken(): Promise<string | null> {
    return await TelegramTokenService.getWebappBotToken();
  }

  // Отправка сообщения в Telegram
  private static async sendTelegramMessage(telegramId: string, message: string) {
    try {
      const webappBotToken = await this.getWebappBotToken();
      if (!webappBotToken) {
        console.error('❌ WEBAPP_TELEGRAM_BOT_TOKEN not found in database or environment');
        return;
      }

      const url = `https://api.telegram.org/bot${webappBotToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramId,
          text: message,
          parse_mode: 'HTML'
        }),
      });

      if (response.ok) {
        console.log('📱 Stats message sent to admin');
      } else {
        console.error('❌ Failed to send stats message');
      }
      
    } catch (error) {
      console.error('❌ Error sending telegram message:', error);
    }
  }

  // Метод для ручного запуска обработки задач (для тестирования)
  static async runManualJobProcessing() {
    console.log('🔧 Running manual job processing...');
    await this.processScheduledJobs();
  }

  // Получение статистики по задачам
  static async getJobsStatus() {
    try {
      const stats = await (prisma as any).notification_jobs.groupBy({
        by: ['status', 'job_type'],
        _count: true
      });

      const totalJobs = await (prisma as any).notification_jobs.count();
      
      const pendingJobs = await (prisma as any).notification_jobs.findMany({
        where: { status: 'pending' },
        orderBy: { scheduled_at: 'asc' },
        take: 5,
        select: {
          id: true,
          job_type: true,
          scheduled_at: true,
          user_id: true
        }
      });

      return {
        stats,
        totalJobs,
        nextJobs: pendingJobs
      };
      
    } catch (error) {
      console.error('❌ Error getting jobs status:', error);
      throw error;
    }
  }
} 