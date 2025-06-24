const { Redis } = require('@upstash/redis');

async function testRedisWorker() {
  try {
    console.log('🧪 Testing Redis Worker manually...');
    
    // Подключаемся к Redis
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    // Проверяем подключение
    const ping = await redis.ping();
    console.log('✅ Redis ping:', ping);
    
    // Создаем тестовую задачу
    const testJob = {
      id: Date.now() + Math.random(),
      data: {
        type: 'order_status_change',
        data: {
          order: {
            id: 999999,
            status: 1,
            user_id: 125861752,
            total_amount: "5700"
          },
          previousStatus: 0
        }
      },
      createdAt: new Date().toISOString(),
      executeAt: new Date().toISOString()
    };
    
    // Добавляем в очередь notifications
    await redis.zadd('queue:notifications', {
      score: Date.now(),
      member: JSON.stringify(testJob)
    });
    
    console.log('✅ Test job added to Redis queue');
    
    // Проверяем размер очереди
    const queueSize = await redis.zcard('queue:notifications');
    console.log('📊 Queue size:', queueSize);
    
    // Получаем задачи из очереди
    const jobs = await redis.zrange('queue:notifications', 0, Date.now(), {
      byScore: true,
      offset: 0,
      count: 5
    });
    
    console.log('📋 Jobs in queue:', jobs.length);
    if (jobs.length > 0) {
      console.log('📄 First job:', JSON.parse(jobs[0]));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testRedisWorker(); 