const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    console.log('🔍 Проверка изображений товаров...\n');
    
    const products = await prisma.products.findMany({
      where: {
        ancestry: { contains: '/' }
      },
      select: {
        id: true,
        name: true,
        image_url: true
      },
      orderBy: { name: 'asc' }
    });
    
    const withImages = products.filter(p => p.image_url);
    const withoutImages = products.filter(p => !p.image_url);
    
    console.log('=== СТАТИСТИКА ИЗОБРАЖЕНИЙ ===');
    console.log(`📦 Всего товаров: ${products.length}`);
    console.log(`✅ С изображениями: ${withImages.length}`);
    console.log(`❌ Без изображений: ${withoutImages.length}`);
    
    if (withImages.length > 0) {
      console.log('\n=== ТОВАРЫ С ИЗОБРАЖЕНИЯМИ ===');
      withImages.forEach(p => {
        console.log(`${p.id}: ${p.name}`);
        console.log(`   → ${p.image_url}\n`);
      });
    }
    
    if (withoutImages.length > 0) {
      console.log('\n=== ТОВАРЫ БЕЗ ИЗОБРАЖЕНИЙ ===');
      withoutImages.slice(0, 10).forEach(p => {
        console.log(`${p.id}: ${p.name}`);
      });
      if (withoutImages.length > 10) {
        console.log(`... и еще ${withoutImages.length - 10} товаров`);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages(); 