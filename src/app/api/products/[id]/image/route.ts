import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { S3Service } from '@/lib/services/s3';

const prisma = new PrismaClient();

export async function GET(
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

    // Находим изображение товара
    const attachment = await prisma.active_storage_attachments.findFirst({
      where: {
        record_type: 'Product',
        record_id: productId,
        name: 'image'
      },
      include: {
        active_storage_blobs: true
      }
    });

    if (!attachment || !attachment.active_storage_blobs) {
      return NextResponse.json(
        { error: 'No image found for this product' },
        { status: 404 }
      );
    }

    const imageUrl = S3Service.getImageUrl(attachment.active_storage_blobs.key);

    return NextResponse.json({
      success: true,
      imageUrl,
      imageKey: attachment.active_storage_blobs.key,
      filename: attachment.active_storage_blobs.filename,
      contentType: attachment.active_storage_blobs.content_type,
      fileSize: Number(attachment.active_storage_blobs.byte_size)
    });

  } catch (error) {
    console.error('Error fetching product image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch product image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 