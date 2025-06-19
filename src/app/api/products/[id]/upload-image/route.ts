import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const maxSize = 5 * 1024 * 1024; // 5MB

// POST - получение подписанного URL для загрузки изображения товара
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { type, size, filename } = await request.json();

    // Валидация типа файла
    if (!acceptedTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Неподдерживаемый тип файла. Разрешены: PNG, JPG, JPEG, WebP' 
      }, { status: 400 });
    }

    // Валидация размера файла
    if (size > maxSize) {
      return NextResponse.json({ 
        error: 'Файл слишком большой. Максимальный размер: 5MB' 
      }, { status: 400 });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const extension = type.split('/')[1];
    const key = `products/${id}/${timestamp}-${filename || 'image'}.${extension}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: type,
      ContentLength: size,
      Metadata: {
        productId: id,
        uploadedBy: session.user.email,
        originalFilename: filename || 'image',
      },
    });

    const uploadUrl = await getSignedUrl(
      s3Client,
      putObjectCommand,
      { expiresIn: 300 } // 5 минут
    );

    // URL для доступа к файлу
    const publicUrl = `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json({ 
      error: 'Ошибка при создании URL для загрузки' 
    }, { status: 500 });
  }
} 