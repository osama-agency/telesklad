import { prisma } from '../src/libs/prismaDb';

async function findS3Images() {
  try {
    console.log('🔍 Поиск S3 изображений в базе данных...');
    
    // Ищем все товары с S3 изображениями
    const productsWithS3 = await prisma.products.findMany({
      where: {
        image_url: {
          contains: 's3.ru1.storage.beget.cloud'
        }
      },
      select: {
        id: true,
        name: true,
        image_url: true
      }
    });
    
    console.log(`Найдено ${productsWithS3.length} товаров с S3 изображениями:`);
    
    const s3URLs = [];
    for (const product of productsWithS3) {
      console.log(`- ${product.name}: ${product.image_url}`);
      s3URLs.push(product.image_url);
    }
    
    // Также ищем товары с другими внешними изображениями
    const productsWithExternal = await prisma.products.findMany({
      where: {
        image_url: {
          startsWith: 'http'
        },
        NOT: {
          image_url: {
            contains: 's3.ru1.storage.beget.cloud'
          }
        }
      },
      select: {
        id: true,
        name: true,
        image_url: true
      }
    });
    
    console.log(`\nНайдено ${productsWithExternal.length} товаров с другими внешними изображениями:`);
    for (const product of productsWithExternal) {
      console.log(`- ${product.name}: ${product.image_url}`);
    }
    
    // Выводим массив S3 URL для использования в скрипте
    if (s3URLs.length > 0) {
      console.log('\n📋 Массив S3 URL для скрипта:');
      console.log(JSON.stringify(s3URLs, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findS3Images(); 