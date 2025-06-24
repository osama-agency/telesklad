import { NextRequest, NextResponse } from 'next/server';
import { RedisService } from '@/lib/services/redis.service';
import { RedisQueueService } from '@/lib/services/redis-queue.service';

/**
 * GET /api/redis/status
 * Мониторинг состояния Redis и очередей
 */
export async function GET(request: NextRequest) {
  try {
    // Проверяем состояние Redis
    const redisHealth = await RedisService.healthCheck();
    
    // Получаем статистику очередей
    const queueStats = await RedisQueueService.getQueueStats();
    
    // Получаем дополнительную статистику
    const additionalStats = await getAdditionalStats();
    
    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      redis: {
        available: RedisService.isAvailable(),
        health: redisHealth,
        worker: {
          running: RedisQueueService.isWorkerRunning(),
          status: RedisQueueService.isWorkerRunning() ? 'active' : 'stopped'
        }
      },
      queues: queueStats,
      stats: additionalStats
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error getting Redis status:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to get Redis status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/redis/status
 * Управление Redis и очередями
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    let result: any = {};

    switch (action) {
      case 'start_worker':
        await RedisQueueService.startWorker();
        result = { message: 'Queue worker started' };
        break;

      case 'stop_worker':
        RedisQueueService.stopWorker();
        result = { message: 'Queue worker stopped' };
        break;

      case 'clear_queues':
        await RedisQueueService.clearAllQueues();
        result = { message: 'All queues cleared' };
        break;

      case 'restart_worker':
        RedisQueueService.stopWorker();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await RedisQueueService.startWorker();
        result = { message: 'Queue worker restarted' };
        break;

      default:
        return NextResponse.json({
          status: 'error',
          message: 'Invalid action. Available actions: start_worker, stop_worker, clear_queues, restart_worker'
        }, { status: 400 });
    }

    return NextResponse.json({
      status: 'success',
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error executing Redis action:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to execute action',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Получение дополнительной статистики
 */
async function getAdditionalStats() {
  try {
    const redis = await RedisService.getInstance();
    if (!redis) {
      return {
        cache_keys: 0,
        memory_usage: 'N/A',
        connected_clients: 'N/A',
        uptime: 'N/A'
      };
    }

    // Upstash Redis не поддерживает info команду, используем доступные методы
    const keys = await redis.keys('*');
    
    // Получаем размеры очередей
    const notificationQueueSize = await redis.zcard('queue:notifications').catch(() => 0);
    const analyticsQueueSize = await redis.zcard('queue:analytics').catch(() => 0);
    
    return {
      cache_keys: keys.length,
      memory_usage: 'N/A (Upstash managed)',
      connected_clients: 'N/A (Upstash managed)',
      uptime_seconds: 'N/A (Upstash managed)',
      queue_sizes: {
        notifications: notificationQueueSize,
        analytics: analyticsQueueSize
      }
    };
    
  } catch (error) {
    console.error('Error getting additional Redis stats:', error);
    return {
      cache_keys: 0,
      memory_usage: 'Error',
      connected_clients: 'Error',
      uptime: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 