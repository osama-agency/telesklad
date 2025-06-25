import { prisma } from '../src/libs/prismaDb';

async function checkVideoSetting() {
  try {
    const videoSetting = await prisma.settings.findFirst({
      where: { variable: 'first_video_id' }
    });
    
    console.log('📹 Текущая настройка first_video_id:');
    if (videoSetting) {
      console.log('   ID:', videoSetting.id);
      console.log('   Value:', videoSetting.value || 'null');
    } else {
      console.log('   ❌ Настройка не найдена');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVideoSetting();
