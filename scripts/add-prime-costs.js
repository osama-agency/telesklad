const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');

const prisma = new PrismaClient();

const productsToUpdate = [
  // Atominex
  { name: 'Atominex 10 mg', prime_cost: 455 },
  { name: 'Atominex 18 mg', prime_cost: 605 },
  { name: 'Atominex 25 mg', prime_cost: 765 },
  { name: 'Atominex 40 mg', prime_cost: 416 },
  { name: 'Atominex 60 mg', prime_cost: 595 },
  { name: 'Atominex 80 mg', prime_cost: 770 },
  { name: 'Atominex 100 mg', prime_cost: 970 },
  // Attex
  { name: 'Attex 4 mg (сироп)', prime_cost: 280 },
  { name: 'Attex 10 mg', prime_cost: 420 },
  { name: 'Attex 18 mg', prime_cost: 740 },
  { name: 'Attex 25 mg', prime_cost: 797 },
  { name: 'Attex 40 mg', prime_cost: 493 },
  { name: 'Attex 60 mg', prime_cost: 730 },
  { name: 'Attex 80 mg', prime_cost: 960 },
  { name: 'Attex 100 mg', prime_cost: 1170 },
  // Другие препараты
  { name: 'Abilify 5 mg', prime_cost: 300 },
  { name: 'Abilify 15 mg', prime_cost: 430 },
  { name: 'Arislow 1 mg', prime_cost: 255 },
  { name: 'Arislow 2 mg', prime_cost: 285 },
  { name: 'Arislow 3 mg', prime_cost: 310 },
  { name: 'Arislow 4 mg', prime_cost: 340 },
  { name: 'Euthyrox 100 mcg', prime_cost: 105 },
  { name: 'HHS A1 L-Carnitine Lepidium', prime_cost: 280 },
  { name: 'Мирена 20 мкг/24 часа', prime_cost: 1300 },
  { name: 'Risperdal 1 Mg/ml сироп', prime_cost: 245 },
  { name: 'Salazopyrin 500 mg', prime_cost: 220 },
];

async function main() {
  console.log('Финальное обновление себестоимости...');
  let updatedCount = 0;
  let notFoundCount = 0;

  for (const productData of productsToUpdate) {
    const { name, prime_cost } = productData;

    try {
      const result = await prisma.product.updateMany({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
        data: {
          prime_cost: new Decimal(prime_cost),
        },
      });

      if (result.count > 0) {
        console.log(`✅ [${result.count} шт.] Обновлен товар: "${name}" -> себестоимость: ${prime_cost} ₺`);
        updatedCount += result.count;
      } else {
        console.log(`❌ Товар не найден: "${name}"`);
        notFoundCount++;
      }
    } catch (error) {
      console.error(`🚨 Ошибка при обновлении товара "${name}":`, error);
    }
  }

  console.log('\n--- Итог ---');
  console.log(`✅ Обновлено записей: ${updatedCount}`);
  console.log(`❌ Не найдено товаров: ${notFoundCount}`);
  console.log('Обновление завершено.');
}

async function findProducts() {
  console.log('Ищем товары, содержащие "Euthyrox" или "Risperdal"...');
  
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Euthyrox', mode: 'insensitive' } },
        { name: { contains: 'Risperdal', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      prime_cost: true,
    },
  });

  if (products.length > 0) {
    console.log('Найденные товары:');
    console.table(products);
  } else {
    console.log('Не найдено товаров, содержащих "Euthyrox" или "Risperdal".');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

findProducts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

 