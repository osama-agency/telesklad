const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Получаем все user_id из users
  const users = await prisma.users.findMany({ select: { id: true } });
  const userIds = new Set(users.map(u => String(u.id)));

  // Получаем все заказы
  const orders = await prisma.orders.findMany({ select: { id: true, user_id: true } });

  // Фильтруем заказы с несуществующим user_id
  const brokenOrders = orders.filter(order => !userIds.has(String(order.user_id)));

  if (brokenOrders.length === 0) {
    console.log('✅ Нет заказов с несуществующим user_id!');
  } else {
    console.log('❌ Найдены заказы с несуществующим user_id:');
    brokenOrders.forEach(order => {
      console.log(`Order ID: ${order.id}, user_id: ${order.user_id}`);
    });
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 