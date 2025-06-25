import { prisma } from '../src/libs/prismaDb';

async function checkWelcomeSettings() {
  try {
    console.log('🔍 Проверка настроек приветственного сообщения...\n');
    
    // Проверяем welcome_message
    const welcomeMessage = await prisma.settings.findFirst({
      where: { key: 'welcome_message' }
    });
    
    console.log('📱 welcome_message:', welcomeMessage?.value || '❌ НЕ НАЙДЕНО');
    
    // Проверяем preview_msg
    const previewMsg = await prisma.settings.findFirst({
      where: { key: 'preview_msg' }
    });
    
    console.log('📱 preview_msg:', previewMsg?.value || '❌ НЕ НАЙДЕНО');
    
    // Проверяем кнопки
    const botBtnTitle = await prisma.settings.findFirst({
      where: { key: 'bot_btn_title' }
    });
    
    const groupBtnTitle = await prisma.settings.findFirst({
      where: { key: 'group_btn_title' }
    });
    
    const supportBtnTitle = await prisma.settings.findFirst({
      where: { key: 'support_btn_title' }
    });
    
    console.log('\n🔘 Настройки кнопок:');
    console.log('   bot_btn_title:', botBtnTitle?.value || 'Каталог');
    console.log('   group_btn_title:', groupBtnTitle?.value || 'Перейти в СДВГ-чат');
    console.log('   support_btn_title:', supportBtnTitle?.value || 'Задать вопрос');
    
    // Проверяем ссылки
    const tgGroup = await prisma.settings.findFirst({
      where: { key: 'tg_group' }
    });
    
    const tgSupport = await prisma.settings.findFirst({
      where: { key: 'tg_support' }
    });
    
    console.log('\n🔗 Ссылки:');
    console.log('   tg_group:', tgGroup?.value || 'https://t.me/+2rTVT8IxtFozNDY0');
    console.log('   tg_support:', tgSupport?.value || 'https://t.me/strattera_help');
    
    // Проверяем сообщения для заказов
    const messages = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            'tg_msg_unpaid_main',
            'tg_msg_paid_client',
            'tg_msg_paid_admin',
            'tg_msg_on_processing_client',
            'tg_msg_on_processing_courier',
            'tg_msg_on_shipped_courier',
            'tg_msg_set_track_num'
          ]
        }
      }
    });
    
    console.log('\n📨 Сообщения для заказов:');
    messages.forEach(msg => {
      console.log(`   ${msg.key}: ${msg.value ? '✅ Есть' : '❌ НЕТ'}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWelcomeSettings();
