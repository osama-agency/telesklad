import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadToS3 } from '@/lib/s3';
import { S3Service } from '@/lib/services/s3';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Получаем все отзывы с фотографиями из Active Storage
    const reviewsWithPhotos = await prisma.active_storage_attachments.findMany({
      where: {
        record_type: 'Review'
      },
      include: {
        active_storage_blobs: true
      }
    });

    console.log(`Found ${reviewsWithPhotos.length} review photos to migrate`);

    const migrationResults = [];

    for (const attachment of reviewsWithPhotos) {
      try {
        const reviewId = attachment.record_id;
        const blob = attachment.active_storage_blobs;
        
        if (!blob) {
          console.log(`No blob found for attachment ${attachment.id}`);
          continue;
        }

        // Проверяем, существует ли отзыв
        const review = await prisma.reviews.findUnique({
          where: { id: reviewId }
        });

        if (!review) {
          console.log(`Review ${reviewId} not found`);
          continue;
        }

        // Формируем URL для старой фотографии
        // В Active Storage с локальным хранилищем файлы обычно хранятся по пути: /rails/active_storage/blobs/{key}/{filename}
        const oldPhotoUrl = `https://strattera.ru/rails/active_storage/blobs/${blob.key}/${blob.filename}`;
        
        // Создаем новый ключ для S3
        const newS3Key = `reviews/${reviewId}/${Date.now()}_${blob.filename}`;
        
        // Загружаем файл со старого сервера и загружаем в S3
        try {
          const response = await fetch(oldPhotoUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${oldPhotoUrl}: ${response.status}`);
          }
          
          const fileBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(fileBuffer);
          
          // Загружаем в S3
          await uploadToS3(buffer, newS3Key, blob.content_type || 'image/jpeg');
          
          // Получаем URL для нового файла в S3
          const newPhotoUrl = S3Service.getImageUrl(newS3Key);
          
          // Обновляем отзыв, добавляя новую фотографию
          const currentPhotos = review.photos || [];
          const updatedPhotos = [...currentPhotos, newPhotoUrl];
          
          await prisma.reviews.update({
            where: { id: reviewId },
            data: { photos: updatedPhotos }
          });
          
          migrationResults.push({
            reviewId,
            oldUrl: oldPhotoUrl,
            newUrl: newPhotoUrl,
            status: 'success'
          });
          
          console.log(`✅ Migrated photo for review ${reviewId}: ${blob.filename}`);
          
        } catch (error) {
          console.error(`❌ Failed to migrate photo for review ${reviewId}:`, error);
          migrationResults.push({
            reviewId,
            oldUrl: oldPhotoUrl,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'error'
          });
        }
        
      } catch (error) {
        console.error(`Error processing attachment ${attachment.id}:`, error);
      }
    }

    const successCount = migrationResults.filter(r => r.status === 'success').length;
    const errorCount = migrationResults.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      message: `Migration completed: ${successCount} photos migrated successfully, ${errorCount} errors`,
      totalFound: reviewsWithPhotos.length,
      migrated: successCount,
      errors: errorCount,
      results: migrationResults
    });

  } catch (error) {
    console.error('Error migrating review photos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to migrate review photos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET метод для проверки статуса миграции
export async function GET() {
  try {
    // Проверяем количество фотографий в Active Storage
    const activeStorageCount = await prisma.active_storage_attachments.count({
      where: { record_type: 'Review' }
    });

    // Проверяем количество отзывов с фотографиями в новой системе
    const reviewsWithPhotos = await prisma.reviews.findMany({
      where: {
        NOT: {
          photos: {
            equals: []
          }
        }
      },
      select: {
        id: true,
        photos: true
      }
    });

    const newSystemPhotosCount = reviewsWithPhotos.reduce((total, review) => {
      return total + (review.photos?.length || 0);
    }, 0);

    return NextResponse.json({
      activeStorage: {
        totalPhotos: activeStorageCount
      },
      newSystem: {
        reviewsWithPhotos: reviewsWithPhotos.length,
        totalPhotos: newSystemPhotosCount
      },
      migrationNeeded: activeStorageCount > 0,
      reviews: reviewsWithPhotos.map(review => ({
        id: review.id,
        photosCount: review.photos?.length || 0
      }))
    });

  } catch (error) {
    console.error('Error checking migration status:', error);
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
} 