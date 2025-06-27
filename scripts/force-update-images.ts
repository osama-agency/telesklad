import { prisma } from '../src/libs/prismaDb';

async function forceUpdateImages() {
  try {
    console.log('🖼️  Принудительное обновление изображений товаров...');
    
    // Получаем все товары
    const products = await prisma.products.findMany({
      where: {
        ancestry: {
          contains: '/'
        },
        show_in_webapp: true,
        deleted_at: null
      }
    });
    
    console.log(`Найдено ${products.length} товаров`);
    
    // Массив тестовых изображений (используем простые SVG Data URI)
    const testImages = [
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#4F46E5"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Atominex</text>
        </svg>
      `).toString('base64'),
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#7C3AED"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Attex</text>
        </svg>
      `).toString('base64'),
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#EC4899"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Abilify</text>
        </svg>
      `).toString('base64'),
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#10B981"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Product</text>
        </svg>
      `).toString('base64'),
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#F59E0B"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Medicine</text>
        </svg>
      `).toString('base64'),
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#EF4444"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Pills</text>
        </svg>
      `).toString('base64'),
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#3B82F6"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Tablets</text>
        </svg>
      `).toString('base64'),
      'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#8B5CF6"/>
          <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="Arial">Drugs</text>
        </svg>
      `).toString('base64')
    ];
    
    // Обновляем товары
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const imageUrl = testImages[i % testImages.length];
      
      await prisma.products.update({
        where: { id: product.id },
        data: { image_url: imageUrl }
      });
      
      console.log(`✅ Обновлен товар ${product.name}`);
    }
    
    console.log('✨ Все товары обновлены!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceUpdateImages(); 