import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBotSettings() {
  console.log('🔍 Проверяем настройки бота в базе данных...\n');
  
  try {
    const settings = await prisma.settings.findMany({
      where: {
        variable: {
          in: ['preview_msg', 'first_video_id', 'bot_btn_title', 'group_btn_title', 'tg_main_bot', 'admin_ids']
        }
      },
      orderBy: {
        variable: 'asc'
      }
    });
    
    console.log('📋 Найденные настройки:');
    settings.forEach(setting => {
      console.log(`  ${setting.variable}: ${setting.value || 'НЕ УСТАНОВЛЕНО'}`);
    });
    
    console.log('\n🔧 Отсутствующие настройки:');
    const foundVariables = settings.map(s => s.variable);
    const expectedVariables = ['preview_msg', 'first_video_id', 'bot_btn_title', 'group_btn_title', 'tg_main_bot', 'admin_ids'];
    
    expectedVariables.forEach(variable => {
      if (!foundVariables.includes(variable)) {
        console.log(`  ${variable}: ОТСУТСТВУЕТ`);
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка при получении настроек:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBotSettings(); 