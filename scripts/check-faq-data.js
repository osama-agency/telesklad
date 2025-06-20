const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFAQData() {
  try {
    console.log('🔍 Проверяем данные в таблице support_entries...\n');
    
    // Проверяем количество записей
    const count = await prisma.support_entries.count();
    console.log(`📊 Всего записей в support_entries: ${count}`);
    
    if (count > 0) {
      console.log('\n📝 Существующие FAQ записи:');
      const entries = await prisma.support_entries.findMany({
        orderBy: { question: 'asc' }
      });
      
      entries.forEach((entry, index) => {
        console.log(`\n${index + 1}. ID: ${entry.id}`);
        console.log(`   Вопрос: ${entry.question}`);
        console.log(`   Ответ: ${entry.answer?.substring(0, 100)}${entry.answer?.length > 100 ? '...' : ''}`);
        console.log(`   Создан: ${entry.created_at}`);
      });
    } else {
      console.log('\n❌ Таблица support_entries пустая');
    }
    
    // Проверяем также настройки поддержки
    console.log('\n🔧 Проверяем настройки поддержки...');
    const supportSettings = await prisma.settings.findMany({
      where: {
        variable: {
          in: ['tg_support', 'support_working_hours', 'support_response_time']
        }
      }
    });
    
    if (supportSettings.length > 0) {
      console.log('\n⚙️ Настройки поддержки:');
      supportSettings.forEach(setting => {
        console.log(`   ${setting.variable}: ${setting.value || 'не установлено'}`);
      });
    } else {
      console.log('\n⚠️ Настройки поддержки не найдены');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFAQData(); 