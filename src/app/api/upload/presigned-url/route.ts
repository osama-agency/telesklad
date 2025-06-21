import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/s3';

// Разрешенные типы файлов
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, contentType } = body;
    
    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Генерируем presigned URL
    const { uploadUrl, fileUrl } = await getPresignedUploadUrl(
      fileName,
      contentType,
      'products'
    );

    return NextResponse.json({
      success: true,
      uploadUrl,
      fileUrl,
      fileName,
      contentType
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate presigned URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 