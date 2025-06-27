import { createClient } from 'redis';

async function clearRedisCache() {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  try {
    await client.connect();
    console.log('🔗 Connected to Redis');
    
    await client.flushAll();
    console.log('✅ Redis cache cleared successfully!');
    
    await client.disconnect();
  } catch (error) {
    console.error('❌ Error clearing Redis cache:', error);
    process.exit(1);
  }
}

clearRedisCache();