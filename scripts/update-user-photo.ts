import { UserService } from '../src/lib/services/UserService';
import { prisma } from '../src/libs/prismaDb';

async function updateUserPhoto(tgId: string) {
  try {
    console.log(`🔄 Updating photo for user with tg_id: ${tgId}`);
    
    // Проверяем существование пользователя
    const user = await prisma.users.findUnique({
      where: { tg_id: BigInt(tgId) },
      select: {
        id: true,
        tg_id: true,
        first_name_raw: true,
        username: true,
        photo_url: true
      }
    });

    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.first_name_raw || user.username || 'Unknown'}`);
    console.log(`📷 Current photo_url: ${user.photo_url || 'None'}`);

    // Обновляем фото
    const newPhotoUrl = await UserService.updateUserPhotoFromTelegram(tgId);

    if (newPhotoUrl) {
      console.log(`✅ Photo updated successfully!`);
      console.log(`🖼️ New photo URL: ${newPhotoUrl}`);
    } else {
      console.log('❌ Failed to update photo - no photo found or API error');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Получаем tg_id из аргументов командной строки
const tgId = process.argv[2];

if (!tgId) {
  console.error('Usage: npm run update-photo <tg_id>');
  process.exit(1);
}

updateUserPhoto(tgId); 