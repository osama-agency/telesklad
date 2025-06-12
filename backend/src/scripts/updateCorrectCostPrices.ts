import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Правильные цены товаров в лирах из аналитики товаров
const correctCostDatabase: Record<string, number> = {
  'Atominex 10 mg': 455,
  'Abilify 15 mg': 430,
  'Attex 100 mg': 1170,
  'Atominex 25 mg': 765,
  'Atominex 60 mg': 595,
  'Atominex 40 mg': 416,
  'Atominex 18 mg': 605,
  'Atominex 80 mg': 770,
  'Attex 4 mg (сироп)': 280,
  'Attex 10 mg': 420,
  'Atominex 100 mg': 970,
  'Attex 18 mg': 740,
  'Attex 80 mg': 960,
  'HHS A1 L-Carnitine Lepidium': 280,
  'Мирена 20 мкг/24 часа': 1300,
  'Arislow 1 mg': 255,
  'Arislow 2 mg': 285,
  'Arislow 3 mg': 310,
  'Arislow 4 mg': 340,
  'Attex 25 mg': 797,
  'Attex 40 mg': 495,
  'Attex 60 mg': 730,
  'Abilify 5 mg': 300,
  'Risperdal 1 мг/мл сироп': 245,
  'Salazopyrin 500 mg': 220,
  'Euthyrox 100 мсг': 105
}

async function updateCorrectCostPrices() {
  console.log('🚀 Обновляем базу данных ПРАВИЛЬНЫМИ себестоимостями...')

  let updatedCount = 0
  let notFoundCount = 0
  let errorCount = 0

  for (const [productName, correctCostTRY] of Object.entries(correctCostDatabase)) {
    try {
      console.log(`🔍 Ищем товар: "${productName}" с ценой ${correctCostTRY}₺`)

      // Ищем товар по точному названию или частичному совпадению
      let product = await prisma.product.findFirst({
        where: {
          name: {
            equals: productName,
            mode: 'insensitive'
          }
        }
      })

      // Если не найден по точному названию, ищем по частичному совпадению
      if (!product) {
        product = await prisma.product.findFirst({
          where: {
            name: {
              contains: productName.replace(/\s*(mg|мг|мсг|мкг).*$/i, ''), // убираем дозировку для поиска
              mode: 'insensitive'
            }
          }
        })
      }

      if (product) {
        const oldCostTRY = product.costPriceTRY

        await prisma.product.update({
          where: { id: product.id },
          data: {
            costPriceTRY: correctCostTRY,
            costPrice: correctCostTRY * 2.13, // обновляем и рублевую стоимость
            updatedAt: new Date()
          }
        })

        console.log(`✅ Обновлен "${product.name}": ${oldCostTRY}₺ → ${correctCostTRY}₺`)
        updatedCount++
      } else {
        console.warn(`❌ Товар не найден: "${productName}"`)
        notFoundCount++
      }
    } catch (error) {
      console.error(`❌ Ошибка при обновлении "${productName}":`, error)
      errorCount++
    }
  }

  console.log(`\n📊 Результаты обновления:`)
  console.log(`✅ Обновлено: ${updatedCount} товаров`)
  console.log(`❌ Не найдено: ${notFoundCount} товаров`)
  console.log(`💥 Ошибок: ${errorCount}`)

  await prisma.$disconnect()
}

updateCorrectCostPrices()
  .then(() => {
    console.log('🎉 Обновление завершено!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })
