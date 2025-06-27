const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

// Маппинг товаров к изображениям (по названиям из ваших файлов)
const productImageMapping = {
  'Abilify 30 mg': 'abilify-30mg.jpg',
  'Abilify 15 mg': 'abilify-15mg.jpg', 
  'Abilify 5 mg': 'abilify-5mg.jpg',
  'Arislow 1 mg': 'arislow-1mg.jpg',
  'Arislow 2 mg': 'arislow-2mg.jpg',
  'Arislow 3 mg': 'arislow-3mg.jpg',
  'Arislow 4 mg': 'arislow-4mg.jpg',
  'Atominex 10 mg': 'atominex-10mg.jpg',
  'Atominex 100 mg': 'atominex-100mg.jpg',
  'Atominex 18 mg': 'atominex-18mg.jpg',
  'Atominex 25 mg': 'atominex-25mg.jpg',
  'Atominex 40 mg': 'atominex-40mg.jpg',
  'Atominex 60 mg': 'atominex-60mg.jpg',
  'Atominex 80 mg': 'atominex-80mg.jpg',
  'Attex 10 mg': 'attex-10mg.jpg',
  'Attex 100 mg': 'attex-100mg.jpg',
  'Attex 18 mg': 'attex-18mg.jpg',
  'Attex 25 mg': 'attex-25mg.jpg',
  'Attex 4 mg (сироп)': 'attex-4mg-syrup.jpg',
  'Attex 40 mg': 'attex-40mg.webp', // Уже есть в S3
  'Attex 60 mg': 'attex-60mg.jpg',
  'Attex 80 mg': 'attex-80mg.jpg',
  'Euthyrox 100 mcg': 'euthyrox-100mcg.jpg',
  'HHS A1 L-Carnitine Lepidium': 'hhs-a1.jpg',
  'Мирена 20 мкг/24 часа': 'mirena.jpg',
  'Risperdal 1 Mg/ml сироп': 'risperdal-syrup.jpg',
  'Salazopyrin 500 mg': 'salazopyrin-500mg.jpg'
};

// Функция загрузки файла в S3
async function uploadToS3(buffer, fileName, contentType) {
  const key = `products/${Date.now()}-${fileName}`;
  
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

// Функция скачивания изображения по URL
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Основная функция
async function uploadProductImages() {
  try {
    console.log('🚀 Начинаю загрузку изображений товаров...\n');

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

      // Проверяем есть ли маппинг для этого товара
      const imageFileName = productImageMapping[product.name];
      if (!imageFileName) {
        console.log(`⚠️  Нет изображения для: ${product.name}`);
        errorCount++;
        continue;
      }

      try {
        // Конвертируем название в URL (предполагаем что изображения лежат в GitHub или другом источнике)
        // Пока создадим заглушку - вы можете заменить на реальные URL
        const imageUrl = `https://example.com/images/${imageFileName}`;
        
        // Для демонстрации создадим простое изображение
        const simpleImageBuffer = Buffer.from(`
          <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="400" fill="#4F46E5"/>
            <text x="200" y="200" text-anchor="middle" dy=".3em" fill="white" font-size="16" font-family="Arial">${product.name}</text>
          </svg>
        `);

        // Загружаем в S3
        const s3Url = await uploadToS3(
          simpleImageBuffer, 
          `${product.id}-${imageFileName.replace('.jpg', '.svg')}`,
          'image/svg+xml'
        );

        // Обновляем базу данных
        await prisma.products.update({
          where: { id: product.id },
          data: { image_url: s3Url }
        });

        console.log(`✅ Обновлен в БД: ${product.name}`);
        uploadedCount++;

        // Небольшая пауза чтобы не перегрузить S3
        await new Promise(resolve => setTimeout(resolve, 500));

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

  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем если вызван напрямую
if (require.main === module) {
  uploadProductImages();
}

module.exports = { uploadProductImages }; 