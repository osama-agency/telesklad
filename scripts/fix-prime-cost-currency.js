const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка и исправление валюты в поле prime_cost...');
  
  // Получаем актуальный курс лиры
  const exchangeRate = await prisma.exchange_rates.findFirst({
    where: { currency: 'TRY' },
    orderBy: { effectiveDate: 'desc' }
  });

  if (!exchangeRate) {
    console.error('❌ Курс лиры не найден в базе данных');
    return;
  }

  const tryRate = Number(exchangeRate.rateWithBuffer);
  console.log(`💱 Используем курс TRY: ${tryRate} RUB`);

  // Получаем все товары с prime_cost
  const products = await prisma.products.findMany({
    where: {
      prime_cost: {
        not: null,
        gt: 0
      }
    },
    select: {
      id: true,
      name: true,
      prime_cost: true,
      avgpurchasepricerub: true
    }
  });

  console.log(`📦 Найдено ${products.length} товаров с prime_cost`);

  let fixedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    const primeCost = Number(product.prime_cost);
    const avgPriceRub = product.avgpurchasepricerub ? Number(product.avgpurchasepricerub) : 0;

    // Если prime_cost подозрительно большой (больше 1000), 
    // вероятно он в рублях и нужно конвертировать в лиры
    if (primeCost > 1000) {
      const primeCostInTry = primeCost / tryRate;
      
      console.log(`🔧 Товар "${product.name}": ${primeCost} → ${primeCostInTry.toFixed(2)} ₺`);
      
      await prisma.products.update({
        where: { id: product.id },
        data: {
          prime_cost: new Decimal(primeCostInTry)
        }
      });
      
      fixedCount++;
    } else {
      // Значение выглядит корректным (в лирах)
      console.log(`✅ Товар "${product.name}": ₺${primeCost} (корректно)`);
      skippedCount++;
    }
  }

  console.log('\n--- Итог ---');
  console.log(`🔧 Исправлено: ${fixedCount} товаров`);
  console.log(`✅ Пропущено (корректные): ${skippedCount} товаров`);
  console.log('Исправление завершено.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 