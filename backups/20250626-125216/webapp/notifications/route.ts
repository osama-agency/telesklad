import { NextRequest, NextResponse } from 'next/server';
import { NotificationCronService } from '@/lib/cron/notification-cron';
import { NotificationSchedulerService } from '@/lib/services/notification-scheduler.service';

// GET - получение статистики по уведомлениям
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const status = await NotificationCronService.getJobsStatus();
      
      // Конвертируем BigInt в числа для корректной сериализации
      const serializedStatus = {
        stats: status.stats ? status.stats.map((stat: any) => ({
          status: stat.status,
          _count: stat._count ? Number(stat._count) : 0
        })) : [],
        totalJobs: status.totalJobs ? Number(status.totalJobs) : 0,
        nextJobs: status.nextJobs ? status.nextJobs.map((job: any) => ({
          id: job.id ? Number(job.id) : 0,
          job_type: job.job_type,
          scheduled_at: job.scheduled_at,
          user_id: job.user_id ? Number(job.user_id) : 0
        })) : []
      };
      
      return NextResponse.json({ success: true, data: serializedStatus });
    }

    if (action === 'manual-run') {
      await NotificationCronService.runManualJobProcessing();
      return NextResponse.json({ success: true, message: 'Manual job processing started' });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action. Use ?action=stats or ?action=manual-run' 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in notifications API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// POST - создание новых уведомлений
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'payment_reminder':
        const { orderId, userId } = data;
        await NotificationSchedulerService.schedulePaymentReminder(orderId, userId);
        return NextResponse.json({ 
          success: true, 
          message: 'Payment reminder scheduled' 
        });

      case 'bonus_notice':
        const { userId: bonusUserId, bonusAmount, orderId: bonusOrderId } = data;
        await NotificationSchedulerService.scheduleBonusNotification(bonusUserId, bonusAmount, bonusOrderId);
        return NextResponse.json({ 
          success: true, 
          message: 'Bonus notification scheduled' 
        });

      case 'restock_notice':
        const { productId } = data;
        await NotificationSchedulerService.scheduleRestockNotification(productId);
        return NextResponse.json({ 
          success: true, 
          message: 'Restock notifications scheduled' 
        });

      case 'account_tier_notice':
        const { userId: tierUserId, tierName, bonusPercentage } = data;
        await NotificationSchedulerService.scheduleAccountTierNotification(tierUserId, tierName, bonusPercentage);
        return NextResponse.json({ 
          success: true, 
          message: 'Account tier notification scheduled' 
        });

      case 'cancel_payment_reminders':
        const { orderId: cancelOrderId } = data;
        await NotificationSchedulerService.cancelPaymentReminders(cancelOrderId);
        return NextResponse.json({ 
          success: true, 
          message: 'Payment reminders cancelled' 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid notification type' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create notification' 
    }, { status: 500 });
  }
} 