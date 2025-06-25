import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUserAuth() {
  try {
    console.log('🔍 Диагностика аутентификации пользователя...');
    
    const user = await prisma.telesklad_users.findUnique({
      where: { email: 'go@osama.agency' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (user) {
      console.log('👤 Данные пользователя:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password hash: ${user.password ? 'установлен' : 'НЕ УСТАНОВЛЕН'}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Updated: ${user.updatedAt}`);
      
      if (user.password) {
        console.log(`  Password hash length: ${user.password.length}`);
        console.log(`  Password starts with: ${user.password.substring(0, 10)}...`);
        
        // Проверим, является ли пароль bcrypt хешем
        const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$');
        console.log(`  Is bcrypt hash: ${isBcryptHash}`);
        
        if (isBcryptHash) {
          // Попробуем проверить с обычными паролями
          const testPasswords = ['password', 'admin', '123456', 'admin123'];
          
          for (const testPassword of testPasswords) {
            try {
              const match = await bcrypt.compare(testPassword, user.password);
              if (match) {
                console.log(`  ✅ Пароль найден: "${testPassword}"`);
                break;
              }
            } catch (error) {
              console.log(`  ❌ Ошибка проверки пароля "${testPassword}": ${error}`);
            }
          }
        } else {
          console.log('  ⚠️ Пароль не является bcrypt хешем');
        }
      } else {
        console.log('  ❌ Пароль не установлен в базе данных');
      }
    } else {
      console.log('❌ Пользователь не найден');
    }

    // Проверим переменные окружения
    console.log('\n🔧 Переменные окружения:');
    console.log(`  NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'установлен' : 'не установлен'}`);
    console.log(`  SECRET: ${process.env.SECRET ? 'установлен' : 'не установлен'}`);
    console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserAuth(); 