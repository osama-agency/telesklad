#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TEST_USER_ID = 9999;

async function resetTestUser() {
  try {
    console.log('🧹 Очистка данных тестового пользователя...');

    // Удаляем все данные тестового пользователя
    console.log('Удаляем подписки...');
    await prisma.product_subscriptions.deleteMany({
      where: { user_id: TEST_USER_ID }
    });

    console.log('Удаляем избранное...');
    await prisma.favorites.deleteMany({
      where: { user_id: TEST_USER_ID }
    });

    console.log('Удаляем корзины...');
    await prisma.carts.deleteMany({
      where: { user_id: TEST_USER_ID }
    });

    console.log('Удаляем заказы и их товары...');
    // Сначала удаляем order_items
    const orders = await prisma.orders.findMany({
      where: { user_id: TEST_USER_ID },
      select: { id: true }
    });
    
    if (orders.length > 0) {
      const orderIds = orders.map(order => order.id);
      await prisma.order_items.deleteMany({
        where: { order_id: { in: orderIds } }
      });
    }
    
    // Затем удаляем сами заказы
    await prisma.orders.deleteMany({
      where: { user_id: TEST_USER_ID }
    });

    console.log('Удаляем пользователя...');
    await prisma.users.deleteMany({
      where: { id: TEST_USER_ID }
    });

    console.log('✅ Тестовый пользователь и все его данные удалены');
    console.log('💡 При следующем запросе к /api/webapp/profile тестовый пользователь будет создан заново');

  } catch (error) {
    console.error('❌ Ошибка при сбросе тестового пользователя:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
resetTestUser(); 