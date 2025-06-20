const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedLoyaltyTiers() {
  try {
    console.log('🌱 Создание уровней лояльности...');

    // Проверяем, есть ли уже уровни
    const existingTiers = await prisma.account_tiers.findMany();
    
    if (existingTiers.length > 0) {
      console.log('✅ Уровни лояльности уже существуют:', existingTiers.length);
      return;
    }

    // Создаем уровни лояльности как в старом проекте
    const tiers = await prisma.account_tiers.createMany({
      data: [
        {
          title: 'Старт',
          order_threshold: 1,
          bonus_percentage: 1,
          order_min_amount: 0,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          title: 'Серебряный',
          order_threshold: 10,
          bonus_percentage: 2,
          order_min_amount: 0,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          title: 'Золотой',
          order_threshold: 30,
          bonus_percentage: 3,
          order_min_amount: 0,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    });

    console.log('✅ Созданы уровни лояльности:', tiers.count);

    // Создаем настройки для системы лояльности
    const settings = [
      {
        variable: 'bonus_threshold',
        value: '5000',
        description: 'Минимальная сумма заказа для начисления бонусов',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        variable: 'delivery_price',
        value: '500',
        description: 'Стоимость доставки',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    for (const setting of settings) {
      await prisma.settings.upsert({
        where: { variable: setting.variable },
        update: setting,
        create: setting
      });
    }

    console.log('✅ Настройки системы лояльности созданы');

  } catch (error) {
    console.error('❌ Ошибка создания уровней лояльности:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedLoyaltyTiers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 