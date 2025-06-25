import { PrismaClient } from '@prisma/client';
import { SettingsService } from '../src/lib/services/SettingsService';
import { ReportService } from '../src/lib/services/ReportService';

const prisma = new PrismaClient();

async function testFullWorkflow() {
  console.log('🧪 Тестирование полного workflow: Заказ → Оплата → Обработка → Отправка\n');

  try {
    // 1. Создаем тестовый заказ
    console.log('1️⃣ Создание тестового заказа...');
    
    const testUser = await prisma.users.findFirst({
      where: { tg_id: 125861752 } // Админ как тестовый пользователь
    });

    if (!testUser) {
      console.error('❌ Тестовый пользователь не найден');
      return;
    }

    const testOrder = await prisma.orders.create({
      data: {
        user_id: testUser.id,
        total_amount: 2500,
        status: 0, // unpaid
        deliverycost: 500,
        customeraddress: 'Тестовый адрес для проверки',
        created_at: new Date(),
        updated_at: new Date(),
                 order_items: {
           create: [
             {
               product_id: BigInt(1), // Предполагаем что есть продукт с ID 1
               quantity: 2,
               price: 1250,
               name: 'Тестовый препарат',
               created_at: new Date(),
               updated_at: new Date()
             }
           ]
         }
      },
      include: {
        users: true,
        order_items: {
          include: {
            products: true
          }
        },
        bank_cards: true
      }
    });

    console.log(`✅ Заказ создан: №${testOrder.id}`);

    // 2. Тестируем переход статусов
    console.log('\n2️⃣ Тестирование переходов статусов...');

    // Статус: unpaid (0) → paid (1)
    console.log('\n   📝 Заказ создан (unpaid)...');
    await ReportService.handleOrderStatusChange(testOrder as any, -1);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Обновляем статус на paid
    const paidOrder = await prisma.orders.update({
      where: { id: testOrder.id },
      data: { status: 1, paid_at: new Date() },
      include: {
        users: true,
        order_items: {
          include: {
            products: true
          }
        },
        bank_cards: true
      }
    });

    console.log('   💳 Заказ оплачен (paid)...');
    await ReportService.handleOrderStatusChange(paidOrder as any, 0);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Обновляем статус на processing
    const processingOrder = await prisma.orders.update({
      where: { id: testOrder.id },
      data: { status: 2 },
      include: {
        users: true,
        order_items: {
          include: {
            products: true
          }
        },
        bank_cards: true
      }
    });

    console.log('   🔄 Заказ обрабатывается (processing)...');
    await ReportService.handleOrderStatusChange(processingOrder as any, 1);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Обновляем статус на shipped с трек-номером
    const shippedOrder = await prisma.orders.update({
      where: { id: testOrder.id },
      data: { 
        status: 3, 
        tracking_number: 'TEST123456789',
        shipped_at: new Date()
      },
      include: {
        users: true,
        order_items: {
          include: {
            products: true
          }
        },
        bank_cards: true
      }
    });

    console.log('   📦 Заказ отправлен (shipped)...');
    await ReportService.handleOrderStatusChange(shippedOrder as any, 2);

    console.log('\n✅ Workflow протестирован!');
    console.log('\n📋 Что должно было произойти:');
    console.log('   1. Клиент получил реквизиты для оплаты');
    console.log('   2. Админ получил уведомление о необходимости проверить оплату');
    console.log('   3. Клиент получил подтверждение что оплата проверяется');
    console.log('   4. Курьер получил уведомление о необходимости отправить заказ');
    console.log('   5. Клиент получил уведомление что заказ готовится к отправке');
    console.log('   6. Клиент получил трек-номер');
    console.log('   7. Курьер получил подтверждение отправки');

    // Очищаем тестовые данные
    console.log('\n🧹 Очистка тестовых данных...');
    await prisma.order_items.deleteMany({
      where: { order_id: testOrder.id }
    });
    await prisma.orders.delete({
      where: { id: testOrder.id }
    });
    console.log('✅ Тестовые данные удалены');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFullWorkflow(); 