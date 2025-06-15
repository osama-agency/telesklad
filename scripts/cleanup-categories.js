const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupCategories() {
  console.log('🧹 Начинаем очистку категорий из таблицы товаров...');

  try {
    // Находим все записи, которые являются категориями
    const categoriesAsProducts = await prisma.product.findMany({
      where: {
        OR: [
          { ancestry: null },
          { 
            ancestry: {
              not: {
                contains: '/',
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        ancestry: true,
      }
    });

    if (categoriesAsProducts.length === 0) {
      console.log('✅ Категорий в таблице товаров не найдено. Очистка не требуется.');
      return;
    }

    console.log(`🔍 Найдено ${categoriesAsProducts.length} категорий для удаления:`);
    console.table(categoriesAsProducts.map(p => ({ id: p.id, name: p.name, ancestry: p.ancestry || 'NULL' })));

    // Собираем ID для удаления
    const idsToDelete = categoriesAsProducts.map(p => p.id);

    // Удаляем найденные категории
    const deleteResult = await prisma.product.deleteMany({
      where: {
        id: {
          in: idsToDelete,
        },
      },
    });

    console.log(`🗑️ Успешно удалено ${deleteResult.count} записей.`);

  } catch (error) {
    console.error('🚨 Ошибка во время очистки категорий:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Очистка завершена.');
  }
}

cleanupCategories(); 