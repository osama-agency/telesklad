import { prisma } from '../src/libs/prismaDb';

async function testS3Image() {
  try {
    console.log('🧪 Тестирование S3 изображения...');
    
    // Реальное S3 изображение, которое у вас есть
    const s3ImageUrl = 'https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/1751022899083-1751022899083-0lxzgn.webp';
    
    // Проверяем доступность изображения
    try {
      console.log('🔍 Проверяю доступность изображения...');
      const response = await fetch(s3ImageUrl, { method: 'HEAD' });
      console.log(`📊 Статус ответа: ${response.status}`);
      console.log(`📊 Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        console.log('✅ Изображение доступно!');
        
        // Берем первый товар и обновляем его изображение
        const firstProduct = await prisma.products.findFirst({
          where: {
            ancestry: {
              contains: '/'
            },
            show_in_webapp: true,
            deleted_at: null
          }
        });
        
        if (firstProduct) {
          await prisma.products.update({
            where: { id: firstProduct.id },
            data: { image_url: s3ImageUrl }
          });
          
          console.log(`✅ Обновлен товар "${firstProduct.name}" с реальным S3 изображением`);
          console.log(`🔗 URL: ${s3ImageUrl}`);
        }
      } else {
        console.log('❌ Изображение недоступно');
      }
    } catch (error) {
      console.error('❌ Ошибка при проверке изображения:', error);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testS3Image(); 