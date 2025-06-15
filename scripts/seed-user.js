const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('sfera13', 12);
    
    // Создаем пользователя
    const user = await prisma.user.upsert({
      where: { email: 'go@osama.agency' },
      update: {
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User'
      },
      create: {
        email: 'go@osama.agency',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User'
      }
    });
    
    console.log('✅ Пользователь создан/обновлен:', user.email);
  } catch (error) {
    console.error('❌ Ошибка при создании пользователя:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 