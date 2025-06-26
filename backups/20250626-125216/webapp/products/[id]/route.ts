import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { S3Service } from '@/lib/services/s3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (!productId) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Find the product by ID
    const product = await prisma.products.findUnique({
      where: { 
        id: productId,
        deleted_at: null 
      },
      select: {
        id: true,
        name: true,
        price: true,
        old_price: true,
        stock_quantity: true,
        brand: true,
        weight: true,
        dosage_form: true,
        package_quantity: true,
        main_ingredient: true,
        description: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get product image from ActiveStorage
    const attachment = await prisma.active_storage_attachments.findFirst({
      where: {
        record_type: 'Product',
        record_id: Number(product.id),
        name: 'image'
      },
      include: {
        active_storage_blobs: true
      }
    });

    // Transform the data to match the expected format
    const transformedProduct = {
      id: Number(product.id),
      name: product.name,
      price: Number(product.price || 0),
      old_price: product.old_price ? Number(product.old_price) : undefined,
      stock_quantity: Number(product.stock_quantity),
      brand: product.brand,
      weight: product.weight,
      dosage_form: product.dosage_form,
      package_quantity: product.package_quantity,
      main_ingredient: product.main_ingredient,
      description: product.description,
      image_url: attachment ? S3Service.getImageUrl(attachment.active_storage_blobs.key) : undefined,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };

    return NextResponse.json(transformedProduct);

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 