import { prisma } from '../src/libs/prismaDb';

async function checkOrderMessages() {
  try {
    console.log('🔍 Проверка сообщений для заказов...\n');
    
    const messageKeys = [
      'tg_msg_unpaid_main',
      'tg_msg_paid_client', 
      'tg_msg_paid_admin',
      'tg_msg_on_processing_client',
      'tg_msg_on_processing_courier',
      'tg_msg_on_shipped_courier',
      'tg_msg_set_track_num'
    ];
    
    for (const key of messageKeys) {
      const setting = await prisma.settings.findFirst({
        where: { variable: key }
      });
      
      if (setting) {
        console.log(`✅ ${key}:`);
        console.log(`   ${setting.value?.substring(0, 100)}...`);
        
        // Проверяем переменные в сообщении
        const variables = setting.value?.match(/\{[^}]+\}/g) || [];
        if (variables.length > 0) {
          console.log(`   Переменные: ${variables.join(', ')}`);
        }
      } else {
        console.log(`❌ ${key}: НЕ НАЙДЕНО`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderMessages();
