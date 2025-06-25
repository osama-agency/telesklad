import { prisma } from '../src/libs/prismaDb';

// Замените этот ID на реальный file_id видео из Telegram
const VIDEO_FILE_ID = process.argv[2] || 'YOUR_VIDEO_FILE_ID_HERE';

async function updateVideoId() {
  try {
    if (VIDEO_FILE_ID === 'YOUR_VIDEO_FILE_ID_HERE') {
      console.log('❌ Пожалуйста, укажите file_id видео как аргумент:');
      console.log('   npm run script scripts/update-video-id.ts "FILE_ID"');
      return;
    }

    console.log('📹 Обновление first_video_id...');
    console.log('   Новое значение:', VIDEO_FILE_ID);
    
    const updated = await prisma.settings.update({
      where: { variable: 'first_video_id' },
      data: { 
        value: VIDEO_FILE_ID,
        updated_at: new Date()
      }
    });
    
    console.log('✅ Настройка обновлена успешно!');
    console.log('   ID записи:', updated.id);
    console.log('   Значение:', updated.value);
    
    // Проверим, что видео будет использоваться
    console.log('\n📌 Видео будет отправляться вместе с приветственным сообщением');
    console.log('   при условии, что бот сможет его загрузить по file_id');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateVideoId();
