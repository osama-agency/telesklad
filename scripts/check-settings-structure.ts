import { prisma } from '../src/libs/prismaDb';

async function main() {
  try {
    const settings = await prisma.settings.findMany({ take: 10 });
    
    console.log('📋 Таблица settings:');
    settings.forEach(s => {
      console.log(`ID: ${s.id}, Variable: ${s.variable}, Value: ${s.value?.substring(0, 50) || 'null'}`);
    });
    
    // Ищем preview_msg
    const preview = await prisma.settings.findFirst({
      where: { variable: 'preview_msg' }
    });
    
    console.log('\n🎉 preview_msg:', preview?.value || 'НЕ НАЙДЕНО');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
