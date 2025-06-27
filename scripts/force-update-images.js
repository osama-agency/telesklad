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

// Товары для принудительного обновления
const forceUpdateProducts = [
  { name: 'Abilify 15 mg', file: 'abilify-15mg.svg' },
  { name: 'Abilify 30 mg', file: 'abilify-30mg.svg' },
  { name: 'Atominex 18 mg', file: 'atominex-18mg.svg' },
  { name: 'Attex 40 mg', file: 'attex-40mg.svg' },
  { name: 'Euthyrox 100 mcg', file: 'euthyrox-100mcg.svg' }
];

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

// Функция для определения MIME типа
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
  return mimeTypes[ext] || 'image/svg+xml';
}

async function forceUpdateImages() {
  try {
    console.log('🔄 Принудительное обновление изображений...\n');

    for (const item of forceUpdateProducts) {
      console.log(`\n🔄 Обновляю: ${item.name}`);
      
      // Находим товар в базе
      const product = await prisma.products.findFirst({
        where: { name: item.name }
      });
      
      if (!product) {
        console.log(`❌ Товар не найден: ${item.name}`);
        continue;
      }
      
      // Проверяем наличие файла
      const filePath = path.join(IMAGES_DIR, item.file);
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Файл не найден: ${item.file}`);
        continue;
      }
      
      try {
        // Читаем файл
        const imageBuffer = fs.readFileSync(filePath);
        const contentType = getMimeType(item.file);
        
        console.log(`📁 Размер файла: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
        
        // Загружаем в S3
        const s3Url = await uploadToS3(imageBuffer, item.file, contentType);
        
        // Обновляем базу данных
        await prisma.products.update({
          where: { id: product.id },
          data: { image_url: s3Url }
        });
        
        console.log(`✅ Обновлен в БД: ${item.name}`);
        
        // Пауза между загрузками
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Ошибка для ${item.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Принудительное обновление завершено!');
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем если вызван напрямую
if (require.main === module) {
  forceUpdateImages();
}

module.exports = { forceUpdateImages }; 