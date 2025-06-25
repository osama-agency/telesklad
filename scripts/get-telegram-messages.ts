#!/usr/bin/env tsx

import { prisma } from '../src/libs/prismaDb';

async function getTelegramMessages() {
  console.log('📨 Getting Telegram message templates from settings...\n');

  try {
    // Получаем все настройки, связанные с сообщениями Telegram
    const telegramSettings = await prisma.settings.findMany({
      where: {
        variable: {
          startsWith: 'tg_msg_'
        }
      },
      orderBy: {
        variable: 'asc'
      }
    });

    console.log(`Found ${telegramSettings.length} Telegram message templates:\n`);

    telegramSettings.forEach((setting, index) => {
      console.log(`${index + 1}. ${setting.variable}:`);
      console.log(`   "${setting.value}"`);
      console.log(`   Description: ${setting.description || 'No description'}\n`);
    });

    // Формируем объект для удобного использования
    const messagesObject: Record<string, string> = {};
    telegramSettings.forEach(setting => {
      if (setting.variable && setting.value) {
        messagesObject[setting.variable] = setting.value;
      }
    });

    console.log('📋 Messages as object:');
    console.log(JSON.stringify(messagesObject, null, 2));

    // Сохраняем в файл для дальнейшего использования
    const fs = await import('fs');
    const path = './telegram-messages.json';
    fs.writeFileSync(path, JSON.stringify(messagesObject, null, 2));
    console.log(`\n💾 Messages saved to ${path}`);

    return messagesObject;

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск
if (require.main === module) {
  getTelegramMessages().catch((error) => {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  });
}