#!/usr/bin/env npx tsx

async function testPhotoMigrationAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Тестирование API миграции фотографий...\n');
  
  try {
    // 1. Проверка статуса миграции
    console.log('1️⃣ Проверка статуса миграции (GET)...');
    const statusResponse = await fetch(`${baseUrl}/api/webapp/reviews/migrate-photos`);
    const statusData = await statusResponse.json();
    
    console.log('Статус:', statusResponse.status);
    console.log('Данные:', JSON.stringify(statusData, null, 2));
    console.log('\n');
    
    // 2. Если нужна миграция, предлагаем запустить
    if (statusData.migrationNeeded) {
      console.log('⚠️  Обнаружены фотографии для миграции!');
      console.log(`   Active Storage: ${statusData.activeStorage?.totalPhotos || 0} фото`);
      console.log(`   Новая система: ${statusData.newSystem?.totalPhotos || 0} фото`);
      console.log('\n');
      console.log('Для запуска миграции выполните:');
      console.log('curl -X POST http://localhost:3000/api/webapp/reviews/migrate-photos');
    } else if (statusData.error) {
      console.log('❌ Ошибка при проверке статуса:', statusData.error);
      console.log('\nВозможные причины:');
      console.log('1. База данных недоступна');
      console.log('2. Отсутствуют переменные окружения');
      console.log('3. Проблемы с подключением к базе');
    } else {
      console.log('✅ Миграция не требуется');
      console.log(`   Фотографий в новой системе: ${statusData.newSystem?.totalPhotos || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при обращении к API:', error);
    console.log('\nУбедитесь, что:');
    console.log('1. Сервер Next.js запущен (npm run dev)');
    console.log('2. Порт 3000 доступен');
  }
}

// Функция для демонстрации загрузки фото
async function testPhotoUpload() {
  console.log('\n\n📸 Тестирование загрузки фотографий...\n');
  
  try {
    // Получаем presigned URL для загрузки
    console.log('1️⃣ Получение presigned URL...');
    const uploadResponse = await fetch('http://localhost:3000/api/webapp/reviews/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'test-photo.jpg',
        fileType: 'image/jpeg'
      })
    });
    
    const uploadData = await uploadResponse.json();
    
    if (uploadData.uploadUrl) {
      console.log('✅ Presigned URL получен успешно');
      console.log('   URL для загрузки:', uploadData.uploadUrl.substring(0, 100) + '...');
      console.log('   Ключ файла:', uploadData.key);
      console.log('   URL фото после загрузки:', uploadData.photoUrl);
    } else {
      console.log('❌ Не удалось получить URL для загрузки');
      console.log('   Ответ:', JSON.stringify(uploadData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании загрузки:', error);
  }
}

// Запускаем тесты
async function runTests() {
  await testPhotoMigrationAPI();
  await testPhotoUpload();
}

runTests(); 