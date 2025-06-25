/**
 * Исправляем настройки @strattera_bot
 * Удаляем webhook, чтобы бот мог работать с Rails API
 */

const STRATTERA_BOT_TOKEN = '7097447176:AAEcDyjXUEIjZ0-iNSE5BZMGjaiuyDQWiqg';

async function fixStratteraBot() {
  console.log('🔧 Исправление настроек @strattera_bot...\n');

  try {
    // Проверяем текущий статус
    console.log('1️⃣ Проверяем текущий webhook...');
    const infoResponse = await fetch(`https://api.telegram.org/bot${STRATTERA_BOT_TOKEN}/getWebhookInfo`);
    const infoResult = await infoResponse.json();
    
    if (infoResult.ok && infoResult.result.url) {
      console.log(`   Текущий webhook: ${infoResult.result.url}`);
      console.log(`   Ожидающих обновлений: ${infoResult.result.pending_update_count || 0}`);
      
      // Удаляем webhook
      console.log('\n2️⃣ Удаляем webhook...');
      const deleteResponse = await fetch(`https://api.telegram.org/bot${STRATTERA_BOT_TOKEN}/deleteWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drop_pending_updates: true // Удаляем накопившиеся обновления
        }),
      });

      const deleteResult = await deleteResponse.json();
      
      if (deleteResult.ok) {
        console.log('✅ Webhook успешно удален!');
        console.log('✅ Накопившиеся обновления очищены');
      } else {
        console.error('❌ Ошибка удаления webhook:', deleteResult);
        return;
      }
    } else {
      console.log('✅ Webhook уже отсутствует');
    }

    // Проверяем финальный статус
    console.log('\n3️⃣ Проверяем финальный статус...');
    const finalInfoResponse = await fetch(`https://api.telegram.org/bot${STRATTERA_BOT_TOKEN}/getWebhookInfo`);
    const finalInfoResult = await finalInfoResponse.json();
    
    if (finalInfoResult.ok) {
      console.log(`   Webhook URL: ${finalInfoResult.result.url || 'НЕТ (правильно!)'}`);
      console.log(`   Ожидающих обновлений: ${finalInfoResult.result.pending_update_count || 0}`);
    }

    console.log('\n🎉 @strattera_bot готов для работы с Rails API!');
    console.log('\n📋 Что теперь должно работать:');
    console.log('   ✅ @strattera_bot работает с Rails сервером (polling)');
    console.log('   ✅ @strattera_test_bot работает с Next.js (webhook)');
    console.log('   ✅ @telesklad_bot работает с Next.js (уведомления)');

    console.log('\n🔄 Следующие шаги:');
    console.log('   1. Убедитесь что Rails сервер запущен');
    console.log('   2. Проверьте что Rails API правильно настроен для @strattera_bot');
    console.log('   3. Протестируйте @strattera_bot с Rails');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

fixStratteraBot(); 