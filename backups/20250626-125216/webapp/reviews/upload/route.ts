import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, contentType } = body;

    // Валидация
    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName и contentType обязательны' },
        { status: 400 }
      );
    }

    // Проверяем тип файла (только изображения)
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Разрешены только изображения' },
        { status: 400 }
      );
    }

    // Проверяем расширение файла
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Разрешены только файлы: JPG, JPEG, PNG, WEBP' },
        { status: 400 }
      );
    }

    // Создаем безопасное имя файла
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Получаем presigned URL для папки reviews
    const { uploadUrl, fileUrl } = await getPresignedUploadUrl(
      sanitizedFileName,
      contentType,
      'reviews'
    );

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileUrl
    });

  } catch (error) {
    console.error('Error generating upload URL for review photo:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании URL для загрузки' },
      { status: 500 }
    );
  }
} 