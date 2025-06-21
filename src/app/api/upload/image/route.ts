import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';
import sharp from 'sharp';

// Максимальный размер файла (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Разрешенные типы файлов
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Проверяем размер файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Конвертируем файл в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Оптимизируем изображение с помощью Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(800, 800, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer();

    // Генерируем уникальное имя файла
    const fileExtension = 'jpg'; // Всегда сохраняем как JPEG после оптимизации
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Загружаем в S3
    const imageUrl = await uploadToS3(
      optimizedBuffer,
      fileName,
      'image/jpeg',
      'products'
    );

    return NextResponse.json({
      success: true,
      imageUrl,
      originalSize: file.size,
      optimizedSize: optimizedBuffer.length,
      fileName
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 