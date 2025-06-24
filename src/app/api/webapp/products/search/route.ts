import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { S3Service } from '@/lib/services/s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        products: [],
        total: 0,
        query: query || ''
      });
    }

    console.log('🔍 Search query:', query, 'limit:', limit);

    // Search products by name (case-insensitive)
    const products = await prisma.products.findMany({
      where: {
        AND: [
          {
            name: {
              contains: query.trim(),
              mode: 'insensitive'
            }
          },
          { deleted_at: null },
          { show_in_webapp: true }
        ]
      },
      select: {
        id: true,
        name: true,
        price: true,
        old_price: true,
        stock_quantity: true,
        ancestry: true,
        image_url: true
      },
      orderBy: [
        { stock_quantity: 'desc' },
        { name: 'asc' }
      ],
      take: limit
    });

    console.log('🔍 Found products:', products.length);

    // Get images for all products if they don't have direct image_url
    const productIds = products.map(p => Number(p.id));
    const attachments = await prisma.active_storage_attachments.findMany({
      where: {
        record_type: 'Product',
        record_id: { in: productIds },
        name: 'image'
      },
      include: {
        active_storage_blobs: true
      }
    });

    // Create image map
    const imageMap = new Map<number, string>();
    attachments.forEach(attachment => {
      imageMap.set(Number(attachment.record_id), attachment.active_storage_blobs.key);
    });

    // Get category names for products
    const categoryIds = products
      .map(p => p.ancestry?.split('/').pop())
      .filter((id): id is string => Boolean(id))
      .map(id => parseInt(id));

    const categories = await prisma.products.findMany({
      where: {
        id: { in: categoryIds },
        deleted_at: null
      },
      select: {
        id: true,
        name: true
      }
    });

    const categoryMap = new Map<number, string>();
    categories.forEach(cat => {
      categoryMap.set(Number(cat.id), cat.name || '');
    });

    // Transform products
    const transformedProducts = products.map((product: any) => {
      const productId = Number(product.id);
      const blobKey = imageMap.get(productId);
      const categoryIdStr = product.ancestry?.split('/').pop();
      const categoryName = categoryIdStr && categoryIdStr !== null ? categoryMap.get(parseInt(categoryIdStr)) : undefined;
      
      // Приоритет image_url из базы, затем из S3
      let imageUrl = product.image_url;
      if (!imageUrl && blobKey) {
        imageUrl = S3Service.getImageUrl(blobKey);
      }
      
      return {
        id: productId,
        name: product.name,
        price: Number(product.price || 0),
        old_price: product.old_price ? Number(product.old_price) : undefined,
        stock_quantity: Number(product.stock_quantity),
        category_name: categoryName,
        image_url: imageUrl,
        image_url_fallback: blobKey ? S3Service.getOldImageUrl(blobKey) : undefined,
      };
    });

    return NextResponse.json({
      products: transformedProducts,
      total: transformedProducts.length,
      query: query
    });

  } catch (error) {
    console.error('❌ Error searching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search products', 
        details: error instanceof Error ? error.message : String(error),
        products: [],
        total: 0
      },
      { status: 500 }
    );
  }
} 