import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { imageUrl, fileName, fileSize, contentType } = body;

    if (!imageUrl || !fileName) {
      return NextResponse.json(
        { error: 'Image URL and file name are required' },
        { status: 400 }
      );
    }

    // Проверяем существование товара
    const product = await prisma.products.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Удаляем существующее изображение товара, если есть
    await prisma.active_storage_attachments.deleteMany({
      where: {
        record_type: 'Product',
        record_id: productId,
        name: 'image'
      }
    });

    // Извлекаем ключ из URL (последняя часть после последнего слеша)
    const urlParts = imageUrl.split('/');
    const key = urlParts[urlParts.length - 1];

    // Генерируем уникальный ID для blob
    const blobId = Date.now();
    const checksum = crypto.createHash('md5').update(fileName + Date.now()).digest('base64');

    // Создаем запись в active_storage_blobs
    const blob = await prisma.active_storage_blobs.create({
      data: {
        id: blobId,
        key: key,
        filename: fileName,
        content_type: contentType || 'image/jpeg',
        metadata: '{}',
        service_name: 'beget_s3',
        byte_size: fileSize || 0,
        checksum: checksum,
        created_at: new Date(),
      }
    });

    // Создаем запись в active_storage_attachments
    const attachment = await prisma.active_storage_attachments.create({
      data: {
        name: 'image',
        record_type: 'Product',
        record_id: productId,
        blob_id: blob.id,
        created_at: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Image attached to product successfully',
      attachment: {
        id: Number(attachment.id),
        blobId: Number(blob.id),
        key: blob.key,
        imageUrl
      }
    });

  } catch (error) {
    console.error('Error attaching image to product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to attach image to product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 