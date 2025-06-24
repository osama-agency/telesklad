#!/usr/bin/env tsx

import { RedisService } from '../src/lib/services/redis.service';
import { RedisQueueService } from '../src/lib/services/redis-queue.service';
import { CacheService } from '../src/lib/services/cache.service';

/**
 * Скрипт инициализации Redis для NEXTADMIN
 * Запускается автоматически при старте приложения
 */
async function initializeRedis() {
  console.log('🚀 Starting NEXTADMIN with Redis integration...\n');

  try {
    // 1. Инициализируем Redis
    console.log('📡 Initializing Redis connection...');
    await RedisService.initialize();
    
    if (!RedisService.isAvailable()) {
      console.log('⚠️  Redis not available - running in fallback mode');
      console.log('ℹ️  Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable Redis\n');
      return;
    }

    // 2. Проверяем здоровье Redis
    console.log('🔍 Checking Redis health...');
    const health = await RedisService.healthCheck();
    console.log(`✅ Redis health: ${health.status} (latency: ${health.latency}ms)`);

    // 3. Запускаем Queue Worker
    console.log('⚙️  Starting Redis Queue Worker...');
    await RedisQueueService.startWorker();
    console.log('✅ Queue Worker started successfully');

    // 4. Проверяем статистику
    const stats = await RedisQueueService.getQueueStats();
    console.log('\n📊 Current Queue Stats:');
    console.log(`   • Notifications: ${stats.notifications} jobs`);
    console.log(`   • Analytics: ${stats.analytics} jobs`);

    // 5. Очищаем старый кэш при старте (опционально)
    if (process.env.CLEAR_CACHE_ON_START === 'true') {
      console.log('\n🧹 Clearing old cache...');
      await CacheService.clearAllCache();
      console.log('✅ Cache cleared');
    }

    console.log('\n🎉 Redis integration initialized successfully!');
    console.log('📊 Monitor Redis: http://localhost:3000/api/redis/status');
    console.log('📖 Documentation: ./REDIS_INTEGRATION.md\n');

  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    console.log('⚠️  Continuing without Redis - features will use fallback mode\n');
  }
}

/**
 * Демонстрация возможностей Redis
 */
async function demonstrateRedis() {
  if (!RedisService.isAvailable()) {
    return;
  }

  console.log('🔬 Redis Integration Demo:');

  try {
    // Демо кэширования
    console.log('\n1. 📦 Cache Demo:');
    await RedisService.setCache('demo:test', { message: 'Hello Redis!', timestamp: Date.now() }, 60);
    const cached = await RedisService.getCache('demo:test');
    console.log('   ✅ Cached and retrieved:', cached);

    // Демо счетчиков
    console.log('\n2. 🔢 Counter Demo:');
    const count = await RedisService.increment('demo:counter', 3600);
    console.log(`   ✅ Counter incremented to: ${count}`);

    // Демо очереди
    console.log('\n3. 📨 Queue Demo:');
    await RedisQueueService.addNotification('demo_notification', {
      message: 'Test notification',
      userId: 'demo_user'
    });
    console.log('   ✅ Demo notification added to queue');

    // Демо аналитики
    console.log('\n4. 📊 Analytics Demo:');
    await RedisQueueService.addAnalyticsJob('user_activity', {
      userId: 'demo_user',
      action: 'page_view'
    });
    console.log('   ✅ Demo analytics job added');

    console.log('\n🎯 Demo completed! Check /api/redis/status for real-time stats.\n');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

/**
 * Проверка переменных окружения
 */
function checkEnvironment() {
  console.log('🔍 Environment Check:');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const optionalVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'REDIS_URL'
  ];

  console.log('\n✅ Required variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`   ${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
  });

  console.log('\n📦 Redis variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`   ${varName}: ${value ? '✅ Set' : '⚠️  Not set'}`);
  });

  // Проверяем Redis конфигурацию
  const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasRedis = process.env.REDIS_URL;

  if (!hasUpstash && !hasRedis) {
    console.log('\n⚠️  No Redis configuration found');
    console.log('ℹ️  Redis features will be disabled');
    console.log('ℹ️  Add Redis credentials to enable caching and queues');
  }

  console.log('');
}

/**
 * Главная функция
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'demo':
      await initializeRedis();
      await demonstrateRedis();
      process.exit(0);
      break;

    case 'check':
      checkEnvironment();
      await initializeRedis();
      process.exit(0);
      break;

    case 'clear-cache':
      await initializeRedis();
      if (RedisService.isAvailable()) {
        console.log('🧹 Clearing all cache...');
        await CacheService.clearAllCache();
        await RedisQueueService.clearAllQueues();
        console.log('✅ Cache and queues cleared');
      }
      process.exit(0);
      break;

    default:
      // Обычная инициализация для старта приложения
      checkEnvironment();
      await initializeRedis();
      break;
  }
}

// Запускаем только если файл вызван напрямую
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  });
}

export { initializeRedis, demonstrateRedis, checkEnvironment }; 