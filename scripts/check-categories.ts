import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('=== Проверка категорий в базе данных ===\n');
    
    // Получаем все продукты с ancestry
    const products = await prisma.products.findMany({
      where: {
        ancestry: {
          not: null,
        },
        deleted_at: null,
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

    console.log(`Всего продуктов с ancestry: ${products.length}\n`);

    // Анализируем структуру ancestry
    const categories = new Map<string, { name: string; products: any[] }>();
    const topLevelCategories = new Set<string>();

    products.forEach(product => {
      if (!product.ancestry) return;

      const parts = product.ancestry.split('/');
      
      // Если нет "/" - это категория верхнего уровня
      if (parts.length === 1) {
        topLevelCategories.add(product.ancestry);
        categories.set(product.ancestry, {
          name: product.name || 'Без названия',
          products: []
        });
      } else {
        // Это товар - добавляем в категорию
        const categoryId = parts[0];
        const category = categories.get(categoryId);
        if (category) {
          category.products.push(product);
        }
      }
    });

    console.log('=== Категории верхнего уровня ===');
    topLevelCategories.forEach(catId => {
      const category = categories.get(catId);
      const catProduct = products.find(p => p.ancestry === catId);
      console.log(`ID: ${catId}, Название: ${catProduct?.name || 'Не найдено'}`);
    });

    console.log('\n=== Товары по категориям ===');
    categories.forEach((category, catId) => {
      if (category.products.length > 0) {
        console.log(`\nКатегория "${category.name}" (ID: ${catId}):`);
        console.log(`Количество товаров: ${category.products.length}`);
        console.log('Примеры товаров:');
        category.products.slice(0, 3).forEach(p => {
          console.log(`  - ${p.name} (ancestry: ${p.ancestry}, brand: ${p.brand})`);
        });
      }
    });

    // Проверяем бренды для сравнения
    console.log('\n=== Уникальные бренды ===');
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    console.log('Бренды:', Array.from(brands).sort());

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories(); 