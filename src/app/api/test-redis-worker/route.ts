import { NextRequest, NextResponse } from 'next/server';
import { RedisQueueService } from '@/lib/services/redis-queue.service';

/**
 * Тестовый endpoint для проверки Redis Worker
 * GET /api/test-redis-worker - добавить тестовую задачу
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Redis Worker with order_status_change');
    
    // Создаем тестовые данные заказа (без обращения к БД)
    const testOrder = {
      id: 999999,
      status: 1, // paid
      total_amount: "5700",
      user_id: 125861752,
      address: "199106, г Санкт-Петербург, ул Шевченко, дом 16, корп. 2, кв. 999",
      first_name: "Эльдар",
      last_name: "Тестов", 
      phone_number: "+7 (999) 999-99-99",
      order_items: [
        {
          product: { name: "Atominex 18 mg" },
          quantity: 1,
          price: "5200"
        }
      ]
    };
    
    const previousStatus = 0; // unpaid
    
    // Добавляем задачу в очередь
    await RedisQueueService.addNotificationJob('order_status_change', {
      order: testOrder,
      previousStatus
    });
    
    console.log('✅ Test order_status_change job added to queue');
    
    // Проверяем статус очереди
    const stats = await RedisQueueService.getQueueStats();
    
    return NextResponse.json({
      status: 'success',
      message: 'Test order_status_change job added to Redis queue',
      testOrder: {
        id: testOrder.id,
        status: testOrder.status,
        user_id: testOrder.user_id
      },
      queueStats: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test Redis Worker error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Redis Worker',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 