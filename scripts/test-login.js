const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔐 Тестируем вход в систему...');
    
    // Проверяем пользователя в базе данных
    const user = await prisma.telesklad_users.findUnique({
      where: {
        email: 'go@osama.agency'
      }
    });

    if (!user) {
      console.log('❌ Пользователь не найден');
      return;
    }

    console.log('👤 Пользователь найден:', {
      id: user.id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      name: user.name
    });

    if (!user.password) {
      console.log('❌ У пользователя нет пароля');
      return;
    }

    // Проверяем пароль
    const testPassword = 'admin123';
    const passwordMatch = await bcrypt.compare(testPassword, user.password);
    
    console.log('🔑 Проверка пароля:', {
      testPassword: testPassword,
      passwordMatch: passwordMatch
    });

    if (passwordMatch) {
      console.log('✅ Пароль правильный! Вход должен работать.');
    } else {
      console.log('❌ Пароль неправильный!');
      
      // Попробуем обновить пароль
      console.log('🔄 Обновляем пароль...');
      const newHashedPassword = await bcrypt.hash(testPassword, 12);
      
      await prisma.telesklad_users.update({
        where: { id: user.id },
        data: { password: newHashedPassword }
      });
      
      console.log('✅ Пароль обновлен!');
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin(); 