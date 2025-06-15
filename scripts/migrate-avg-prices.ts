import { PrismaClient } from '@prisma/client';
import { ExchangeRateService } from '../src/lib/services/exchange-rate.service';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function migrateAveragePrices() {
  console.log('Starting migration of average purchase prices...');

  try {
    // Сначала убедимся, что есть актуальный курс TRY
    console.log('Checking for TRY exchange rate...');
    let tryRate;
    
    try {
      tryRate = await ExchangeRateService.getLatestRate('TRY');
      console.log(`Found TRY rate: ${tryRate.rate} RUB (with buffer: ${tryRate.rateWithBuffer})`);
    } catch (error) {
      console.log('No TRY rate found, fetching from CBR...');
      const result = await ExchangeRateService.updateTRYRate();
      if (!result.success) {
        throw new Error('Failed to fetch TRY rate from CBR');
      }
      tryRate = await ExchangeRateService.getLatestRate('TRY');
      console.log(`Fetched TRY rate: ${tryRate.rate} RUB (with buffer: ${tryRate.rateWithBuffer})`);
    }

    // Получаем все продукты с остатками
    const products = await prisma.product.findMany({
      where: {
        stock_quantity: {
          gt: 0
        }
      }
    });

    console.log(`Found ${products.length} products with stock to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // Пропускаем, если уже есть средняя цена
      if (product.avgPurchasePriceRub && Number(product.avgPurchasePriceRub) > 0) {
        console.log(`Skipping product ${product.id} "${product.name}" - already has avgPurchasePriceRub`);
        skippedCount++;
        continue;
      }

      // Используем prime_cost как базу для расчета, если есть
      let avgPrice: number;
      
      if (product.prime_cost && Number(product.prime_cost) > 0) {
        // Если prime_cost уже в рублях, используем как есть
        avgPrice = Number(product.prime_cost);
        console.log(`Product ${product.id} "${product.name}" - using existing prime_cost: ${avgPrice} RUB`);
      } else if (product.price && Number(product.price) > 0) {
        // Если нет prime_cost, используем 70% от цены продажи как приблизительную себестоимость
        avgPrice = Number(product.price) * 0.7;
        console.log(`Product ${product.id} "${product.name}" - estimated from price: ${avgPrice} RUB`);
      } else {
        console.log(`Skipping product ${product.id} "${product.name}" - no price data available`);
        skippedCount++;
        continue;
      }

      // Обновляем продукт
      await prisma.product.update({
        where: { id: product.id },
        data: {
          avgPurchasePriceRub: new Decimal(avgPrice),
          prime_cost: new Decimal(avgPrice) // Синхронизируем prime_cost
        }
      });

      migratedCount++;
      console.log(`✓ Migrated product ${product.id} "${product.name}"`);
    }

    console.log('\nMigration completed!');
    console.log(`- Migrated: ${migratedCount} products`);
    console.log(`- Skipped: ${skippedCount} products`);
    console.log(`- Migration date: ${new Date().toISOString()}`);

    // Сохраняем информацию о миграции
    await prisma.$executeRaw`
      INSERT INTO exchange_rates (id, currency, rate, "rateWithBuffer", "bufferPercent", source, "effectiveDate", "createdAt")
      VALUES (
        gen_random_uuid(),
        'MIGRATION_MARKER',
        1,
        1,
        0,
        'SYSTEM',
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING
    `;

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем миграцию
migrateAveragePrices(); 