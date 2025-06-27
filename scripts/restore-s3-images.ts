import { prisma } from '../src/libs/prismaDb';

async function restoreS3Images() {
  try {
    console.log('🔄 Восстановление реальных S3 изображений...');
    
    // Список реальных изображений из S3 (примеры)
    const s3Images = [
      'https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/1751022899083-1751022899083-0lxzgn.webp',
      'https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/1751022899084-1751022899084-abc123.webp',
      'https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/1751022899085-1751022899085-def456.webp',
      // Добавьте больше реальных URL из вашего S3
    ];
    
    // Получаем все товары
    const products = await prisma.products.findMany({
      where: {
        ancestry: {
          contains: '/'
        },
        show_in_webapp: true,
        deleted_at: null
      },
      take: 10 // Обновляем первые 10 товаров для примера
    });
    
    console.log(`Найдено ${products.length} товаров для обновления`);
    
    // Обновляем товары реальными изображениями
    for (let i = 0; i < Math.min(products.length, s3Images.length); i++) {
      const product = products[i];
      const imageUrl = s3Images[i];
      
      // Проверяем доступность изображения
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok) {
          await prisma.products.update({
            where: { id: product.id },
            data: { image_url: imageUrl }
          });
          console.log(`✅ Обновлен товар ${product.name} -> ${imageUrl}`);
        } else {
          console.log(`❌ Изображение недоступно: ${imageUrl}`);
        }
      } catch (error) {
        console.log(`❌ Ошибка проверки изображения: ${imageUrl}`);
      }
    }
    
    // Для остальных товаров используем заглушки
    const remainingProducts = products.slice(s3Images.length);
    const fallbackImages = [
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#4F46E5"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Medicine</text>
        </svg>
      `).toString('base64'),
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#10B981"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Pills</text>
        </svg>
      `).toString('base64')
    ];
    
    for (let i = 0; i < remainingProducts.length; i++) {
      const product = remainingProducts[i];
      const imageUrl = fallbackImages[i % fallbackImages.length];
      
      await prisma.products.update({
        where: { id: product.id },
        data: { image_url: imageUrl }
      });
      console.log(`✅ Обновлен товар ${product.name} -> SVG заглушка`);
    }
    
    console.log('✨ Восстановление завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreS3Images(); 