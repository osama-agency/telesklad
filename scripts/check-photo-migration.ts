#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPhotoMigration() {
  try {
    console.log('🔍 Проверка статуса миграции фотографий отзывов...\n');

    // Проверяем количество фотографий в Active Storage
    const activeStorageCount = await prisma.active_storage_attachments.count({
      where: { record_type: 'Review' }
    });

    console.log(`📸 Фотографии в Active Storage: ${activeStorageCount}`);

    // Получаем детали фотографий из Active Storage
    if (activeStorageCount > 0) {
      const activeStoragePhotos = await prisma.active_storage_attachments.findMany({
        where: { record_type: 'Review' },
        include: {
          active_storage_blobs: true
        }
      });

      console.log('\n📋 Детали фотографий в Active Storage:');
      activeStoragePhotos.forEach((attachment, index) => {
        const blob = attachment.active_storage_blobs;
        console.log(`  ${index + 1}. Review ID: ${attachment.record_id}`);
        console.log(`     Файл: ${blob?.filename || 'N/A'}`);
        console.log(`     Размер: ${blob?.byte_size ? Math.round(Number(blob.byte_size) / 1024) + ' KB' : 'N/A'}`);
        console.log(`     Тип: ${blob?.content_type || 'N/A'}`);
        console.log(`     Хранилище: ${blob?.service_name || 'N/A'}`);
        console.log('');
      });
    }

    // Проверяем количество отзывов с фотографиями в новой системе
    const reviewsWithNewPhotos = await prisma.reviews.findMany({
      where: {
        NOT: {
          photos: {
            equals: []
          }
        }
      },
      select: {
        id: true,
        photos: true,
        user_id: true,
        product_id: true,
        created_at: true
      }
    });

    const newSystemPhotosCount = reviewsWithNewPhotos.reduce((total, review) => {
      return total + (review.photos?.length || 0);
    }, 0);

    console.log(`🆕 Отзывы с фотографиями в новой системе: ${reviewsWithNewPhotos.length}`);
    console.log(`🖼️  Всего фотографий в новой системе: ${newSystemPhotosCount}`);

    if (reviewsWithNewPhotos.length > 0) {
      console.log('\n📋 Детали отзывов с фотографиями в новой системе:');
      reviewsWithNewPhotos.forEach((review, index) => {
        console.log(`  ${index + 1}. Review ID: ${review.id}`);
        console.log(`     User ID: ${review.user_id}`);
        console.log(`     Product ID: ${review.product_id}`);
        console.log(`     Фотографий: ${review.photos?.length || 0}`);
        console.log(`     Создан: ${review.created_at.toLocaleDateString()}`);
        if (review.photos && review.photos.length > 0) {
          review.photos.forEach((photo, photoIndex) => {
            console.log(`       ${photoIndex + 1}. ${photo}`);
          });
        }
        console.log('');
      });
    }

    // Статус миграции
    console.log('\n📊 СТАТУС МИГРАЦИИ:');
    if (activeStorageCount === 0 && newSystemPhotosCount === 0) {
      console.log('❌ Нет фотографий ни в старой, ни в новой системе');
    } else if (activeStorageCount > 0 && newSystemPhotosCount === 0) {
      console.log('⚠️  Миграция не выполнена. Есть фотографии в Active Storage, но нет в новой системе');
      console.log(`   Запустите: curl -X POST http://localhost:3000/api/webapp/reviews/migrate-photos`);
    } else if (activeStorageCount > 0 && newSystemPhotosCount > 0) {
      console.log('🔄 Частичная миграция. Фотографии есть в обеих системах');
      console.log(`   Active Storage: ${activeStorageCount} фото`);
      console.log(`   Новая система: ${newSystemPhotosCount} фото`);
    } else {
      console.log('✅ Миграция завершена. Все фотографии в новой системе');
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке миграции:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPhotoMigration(); 