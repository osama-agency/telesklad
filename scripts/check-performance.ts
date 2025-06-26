import { prisma } from '../src/libs/prismaDb';
import { RedisService } from '../src/lib/services/redis.service';

async function testPerformance() {
  console.log('🧪 Testing database performance...');
  
  const start = Date.now();
  
  try {
    // Тест подключения к БД
    await prisma.$queryRaw`SELECT 1`;
    console.log(`✅ Database: ${Date.now() - start}ms`);
    
    // Тест Redis
    const redisStart = Date.now();
    await RedisService.setCache('test', { test: true }, 60);
    const cached = await RedisService.getCache('test');
    console.log(`✅ Redis: ${Date.now() - redisStart}ms`);
    
    // Тест API эндпоинта
    const apiStart = Date.now();
    const response = await fetch('http://localhost:3000/api/webapp/products');
    const data = await response.json();
    console.log(`✅ API products: ${Date.now() - apiStart}ms`);
    console.log(`📦 Products count: ${data.products?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPerformance(); 