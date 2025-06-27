const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Конфигурация S3
const s3Client = new S3Client({
  region: 'ru-1',
  endpoint: 'https://s3.ru1.storage.beget.cloud',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const S3_BUCKET = '2c11548b454d-eldar-agency';
const S3_ENDPOINT = 'https://s3.ru1.storage.beget.cloud';
const IMAGES_DIR = path.join(__dirname, '../temp-images');

// Функция загрузки файла в S3
async function uploadToS3(buffer, fileName, contentType) {
  const key = `products/${Date.now()}-${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  });

  try {
    console.log(`📤 Загружаю в S3: ${fileName}`);
    await s3Client.send(command);
    const fileUrl = `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
    console.log(`✅ Загружено: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error(`❌ Ошибка загрузки ${fileName}:`, error);
    throw error;
  }
}

// Функция для определения MIME типа по расширению
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

// Функция поиска подходящего изображения для товара
function findImageForProduct(productName, imageFiles) {
  // Нормализуем название товара для поиска
  const normalizedName = productName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/мг|mg/g, 'mg')
    .replace(/мкг|mcg/g, 'mcg');

  console.log(`🔍 Ищу изображение для: "${productName}" -> "${normalizedName}"`);

  // Ищем точное совпадение
  let matchingFile = imageFiles.find(file => {
    const fileName = path.basename(file, path.extname(file)).toLowerCase();
    return fileName.includes(normalizedName) || normalizedName.includes(fileName);
  });

  if (!matchingFile) {
    // Ищем по ключевым словам
    const keywords = productName.toLowerCase().split(' ');
    matchingFile = imageFiles.find(file => {
      const fileName = path.basename(file, path.extname(file)).toLowerCase();
      return keywords.some(keyword => 
        keyword.length > 2 && fileName.includes(keyword)
      );
    });
  }

  if (matchingFile) {
    console.log(`✅ Найдено изображение: ${matchingFile}`);
  } else {
    console.log(`❌ Изображение не найдено для: ${productName}`);
  }

  return matchingFile;
}

// Основная функция
async function uploadRealImages() {
  try {
    console.log('🚀 Начинаю загрузку реальных изображений товаров...\n');

    // Проверяем папку с изображениями
    if (!fs.existsSync(IMAGES_DIR)) {
      console.error(`❌ Папка с изображениями не найдена: ${IMAGES_DIR}`);
      console.log('📁 Создайте папку temp-images и поместите туда изображения товаров');
      return;
    }

    // Получаем список изображений
    const imageFiles = fs.readdirSync(IMAGES_DIR)
      .filter(file => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
      .map(file => path.join(IMAGES_DIR, file));

    console.log(`📸 Найдено изображений: ${imageFiles.length}`);
    imageFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
    console.log('');

    if (imageFiles.length === 0) {
      console.error('❌ Изображения не найдены в папке temp-images');
      return;
    }

    // Получаем все товары
    const products = await prisma.products.findMany({
      where: {
        ancestry: { contains: '/' }
      },
      select: {
        id: true,
        name: true,
        image_url: true
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📦 Найдено товаров: ${products.length}\n`);

    let uploadedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      console.log(`\n🔄 Обрабатываю: ${product.name} (ID: ${product.id})`);

      // Пропускаем если уже есть S3 URL
      if (product.image_url && product.image_url.includes('s3.ru1.storage.beget.cloud')) {
        console.log(`⏭️  Пропускаю - уже есть S3 изображение`);
        skippedCount++;
        continue;
      }

      // Ищем подходящее изображение
      const imageFile = findImageForProduct(product.name, imageFiles);
      if (!imageFile) {
        console.log(`⚠️  Изображение не найдено для: ${product.name}`);
        errorCount++;
        continue;
      }

      try {
        // Читаем файл
        const imageBuffer = fs.readFileSync(imageFile);
        const fileName = path.basename(imageFile);
        const contentType = getMimeType(fileName);

        console.log(`📁 Размер файла: ${(imageBuffer.length / 1024).toFixed(1)} KB`);

        // Загружаем в S3
        const s3Url = await uploadToS3(imageBuffer, fileName, contentType);

        // Обновляем базу данных
        await prisma.products.update({
          where: { id: product.id },
          data: { image_url: s3Url }
        });

        console.log(`✅ Обновлен в БД: ${product.name}`);
        uploadedCount++;

        // Небольшая пауза чтобы не перегрузить S3
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Ошибка для ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 ИТОГИ:');
    console.log(`✅ Загружено: ${uploadedCount}`);
    console.log(`⏭️  Пропущено: ${skippedCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log(`📦 Всего товаров: ${products.length}`);

    if (uploadedCount > 0) {
      console.log('\n🎉 Изображения успешно загружены в S3 и обновлены в базе данных!');
      console.log('🔄 Обновите страницу каталога для просмотра изменений');
    }

  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем если вызван напрямую
if (require.main === module) {
  uploadRealImages();
}

module.exports = { uploadRealImages }; 