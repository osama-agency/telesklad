import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategoriesDetailed() {
  try {
    console.log('=== Детальная проверка структуры категорий ===\n');
    
    // 1. Проверяем записи с ancestry без "/"
    const topLevelItems = await prisma.products.findMany({
      where: {
        ancestry: {
          not: {
            contains: '/'
          }
        },
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        ancestry: true,
        brand: true,
        stock_quantity: true,
        show_in_webapp: true,
      },
    });

    console.log('=== Записи верхнего уровня (категории) ===');
    topLevelItems.forEach(item => {
      console.log(`ID: ${item.id}, Ancestry: ${item.ancestry}, Name: "${item.name}", Stock: ${item.stock_quantity}, Show: ${item.show_in_webapp}`);
    });

    // 2. Получаем товары с правильной структурой ancestry
    const productsWithCategories = await prisma.products.findMany({
      where: {
        ancestry: {
          contains: '/'
        },
        deleted_at: null,
        show_in_webapp: true,
      },
      select: {
        id: true,
        name: true,
        ancestry: true,
        brand: true,
      },
      orderBy: {
        ancestry: 'asc',
      },
    });

    // 3. Группируем по первому уровню ancestry
    const categoryGroups = new Map<string, any[]>();
    
    productsWithCategories.forEach(product => {
      const categoryId = product.ancestry?.split('/')[0];
      if (categoryId) {
        if (!categoryGroups.has(categoryId)) {
          categoryGroups.set(categoryId, []);
        }
        categoryGroups.get(categoryId)!.push(product);
      }
    });

    console.log('\n=== Товары сгруппированные по категориям ===');
    categoryGroups.forEach((products, categoryId) => {
      console.log(`\nКатегория ID: ${categoryId}`);
      console.log(`Количество товаров: ${products.length}`);
      
      // Ищем название категории
      const categoryItem = topLevelItems.find(item => item.ancestry === categoryId);
      if (categoryItem) {
        console.log(`Название категории: "${categoryItem.name}"`);
      } else {
        console.log(`⚠️  Категория не найдена в базе!`);
      }
      
      console.log('Примеры товаров:');
      products.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id}, ancestry: ${p.ancestry})`);
      });
    });

    // 4. Предлагаем структуру для реальных категорий
    console.log('\n=== ПРЕДЛОЖЕНИЕ: Создать реальные категории ===');
    console.log('На основе анализа товаров, предлагаю создать следующие категории:');
    
    const suggestedCategories = [
      { name: 'Противозачаточные', keywords: ['Ярина', 'Жанин', 'Диане', 'Клайра'] },
      { name: 'Антидепрессанты', keywords: ['Ципралекс', 'Паксил', 'Прозак'] },
      { name: 'Нейролептики', keywords: ['Рисперидон', 'Арисло', 'Абилифай'] },
      { name: 'Стимуляторы ЦНС', keywords: ['Страттера', 'Аттекс', 'Атоминекс'] },
      { name: 'Анксиолитики', keywords: ['Алпразолам', 'Ксанакс'] },
    ];

    suggestedCategories.forEach(cat => {
      const matchingProducts = productsWithCategories.filter(p => 
        cat.keywords.some(keyword => p.name?.toLowerCase().includes(keyword.toLowerCase()))
      );
      if (matchingProducts.length > 0) {
        console.log(`\n"${cat.name}" - найдено ${matchingProducts.length} товаров`);
      }
    });

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoriesDetailed(); 