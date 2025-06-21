import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { NotificationSchedulerService } from '@/lib/services/notification-scheduler.service';
import { NotificationCronService } from '@/lib/cron/notification-cron';

// Функция для проверки и создания тестовых данных
async function ensureUserHasTelegramId(userId: number) {
  try {
    console.log(`🔍 Looking for user ${userId}...`);
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) }
    });

    if (!user) {
      console.error(`❌ User ${userId} not found in database`);
      throw new Error(`User ${userId} not found`);
    }

    console.log(`👤 Found user ${userId}:`, {
      id: user.id?.toString(),
      email: user.email,
      tg_id: user.tg_id?.toString(),
      has_tg_id: !!user.tg_id
    });

    // Если у пользователя нет Telegram ID, добавляем тестовый
    if (!user.tg_id) {
      console.log(`📱 Adding Telegram ID to user ${userId}...`);
      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { 
          tg_id: BigInt(125861752), // Ваш Telegram ID (замените на реальный) 
          updated_at: new Date()
        }
      });
      console.log(`✅ Added Telegram ID to user ${userId}`);
    } else {
      console.log(`✅ User ${userId} already has Telegram ID: ${user.tg_id.toString()}`);
    }

    return user;
  } catch (error: any) {
    console.error(`❌ Error ensuring user ${userId} has Telegram ID:`, error?.message);
    throw error;
  }
}

// Функция для получения следующего ID заказа
async function getNextOrderId(): Promise<number> {
  try {
    console.log('🔍 Getting last order ID from database...');
    
    const lastOrder = await prisma.orders.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });

    const nextId = lastOrder ? Number(lastOrder.id) + 1 : 1;
    console.log(`📊 Last order ID: ${lastOrder?.id?.toString() || 'none'}, Next ID: ${nextId}`);
    
    return nextId;
  } catch (error: any) {
    console.error('❌ Error getting next order ID:', error?.message);
    // Fallback к случайному ID если не удалось получить из базы
    const fallbackId = Math.floor(Math.random() * 1000) + 9000;
    console.log(`🎲 Using fallback order ID: ${fallbackId}`);
    return fallbackId;
  }
}

// Функция для создания тестового заказа
async function createTestOrder(userId: number): Promise<number> {
  try {
    const orderId = await getNextOrderId();
    console.log(`📋 Creating test order ${orderId} for user ${userId}...`);

    const newOrder = await prisma.orders.create({
      data: {
        user_id: BigInt(userId),
        total_amount: 1500,
        status: 0, // UNPAID
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const createdOrderId = Number(newOrder.id);
    console.log(`✅ Created test order ${createdOrderId} for user ${userId}`);
    return createdOrderId;
    
  } catch (error: any) {
    console.error(`❌ Error creating test order:`, error?.message);
    console.error('📍 Full error:', error);
    throw new Error(`Failed to create test order: ${error?.message}`);
  }
}

// POST - создание тестовых уведомлений для отладки
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Starting test notification request...');
    const body = await request.json();
    const { type, test_data } = body;
    console.log('📦 Request data:', { type, test_data });

    // Используем реального пользователя-админа
    const ADMIN_USER_ID = 12; // go@osama.agency
    const TEST_PRODUCT_ID = 30;

    console.log('👤 Ensuring user has Telegram ID...');
    // Проверяем и создаем/обновляем пользователя с Telegram ID если нужно
    await ensureUserHasTelegramId(ADMIN_USER_ID);
    
    console.log('📋 Creating test order...');
    const TEST_ORDER_ID = await createTestOrder(ADMIN_USER_ID);

    console.log(`🎯 Processing test type: ${type}`);

    switch (type) {
      case 'payment_reminder':
        await NotificationSchedulerService.schedulePaymentReminder(TEST_ORDER_ID, ADMIN_USER_ID);
        return NextResponse.json({ 
          success: true, 
          message: 'Test payment reminder scheduled',
          details: `Order ${TEST_ORDER_ID}, User ${ADMIN_USER_ID}`
        });

      case 'bonus_notice':
        const bonusAmount = test_data?.bonus_amount || 250;
        await NotificationSchedulerService.scheduleBonusNotification(ADMIN_USER_ID, bonusAmount, TEST_ORDER_ID);
        return NextResponse.json({ 
          success: true, 
          message: 'Test bonus notification scheduled',
          details: `${bonusAmount} bonuses for order ${TEST_ORDER_ID}`
        });

      case 'restock_notice':
        const productId = test_data?.product_id || TEST_PRODUCT_ID;
        await NotificationSchedulerService.scheduleRestockNotification(productId);
        return NextResponse.json({ 
          success: true, 
          message: 'Test restock notification scheduled',
          details: `Product ${productId}`
        });

      case 'account_tier_notice':
        const tierName = test_data?.tier_name || 'Серебряный';
        const bonusPercentage = test_data?.bonus_percentage || 2;
        await NotificationSchedulerService.scheduleAccountTierNotification(ADMIN_USER_ID, tierName, bonusPercentage);
        return NextResponse.json({ 
          success: true, 
          message: 'Test account tier notification scheduled',
          details: `${tierName} tier (${bonusPercentage}%)`
        });

      case 'process_now':
        // Запускаем обработку задач прямо сейчас
        await NotificationCronService.runManualJobProcessing();
        return NextResponse.json({ 
          success: true, 
          message: 'Manual job processing started'
        });

      case 'quick_test':
        console.log('🎁 Creating quick test notifications...');
        // Создаем несколько тестовых уведомлений с коротким временем
        console.log('📨 Scheduling bonus notification...');
        await NotificationSchedulerService.scheduleBonusNotification(ADMIN_USER_ID, 150, TEST_ORDER_ID);
        
        // Планируем на через 10 секунд
        console.log('📦 Creating restock notification...');
        const now = new Date();
        await (prisma as any).notification_jobs.create({
          data: {
            job_type: 'restock_notice',
            target_id: BigInt(TEST_PRODUCT_ID),
            user_id: BigInt(ADMIN_USER_ID),
            scheduled_at: new Date(now.getTime() + 10 * 1000), // через 10 секунд
            data: { 
              product_id: TEST_PRODUCT_ID,
              created_at: now.toISOString()
            }
          }
        });

        console.log('✅ Quick test notifications created successfully');
        return NextResponse.json({ 
          success: true, 
          message: 'Quick test notifications scheduled',
          details: 'Bonus (30s) and restock (10s) notifications created'
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid test type. Use: payment_reminder, bonus_notice, restock_notice, account_tier_notice, process_now, quick_test' 
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Error creating test notification:', error);
    console.error('📍 Error stack:', error?.stack);
    
    // Возвращаем больше информации об ошибке для отладки
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create test notification',
      details: error?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}

// GET - получение статуса тестовых уведомлений
export async function GET(request: NextRequest) {
  try {
    const status = await NotificationCronService.getJobsStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        total_jobs: status.totalJobs,
        stats: status.stats,
        next_jobs: status.nextJobs.map((job: any) => ({
          id: Number(job.id),
          type: job.job_type,
          scheduled_at: job.scheduled_at,
          user_id: Number(job.user_id)
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error getting test status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get test status' 
    }, { status: 500 });
  }
} 