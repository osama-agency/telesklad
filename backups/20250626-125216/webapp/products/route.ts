import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { S3Service } from '@/lib/services/s3';
import { RedisService } from '@/lib/services/redis.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    
    // 🚀 ДОБАВЛЯЕМ КЭШИРОВАНИЕ
    const cacheKey = `webapp:products:${categoryId || 'default'}`;
    const cached = await RedisService.getCache(cacheKey);
    
    if (cached) {
      console.log('✅ Products from cache');
      return NextResponse.json(cached);
    }

    console.log('API called with category_id:', categoryId);

    // Get category_id from params OR default_product_id from settings (like in Rails)
    let productId: number | null = null;
    
    if (categoryId) {
      productId = parseInt(categoryId);
      console.log('Using provided category_id:', productId);
    } else {
      // Get default_product_id from settings like in Rails
      const defaultSetting = await prisma.settings.findUnique({
        where: { variable: 'default_product_id' }
      });
      
      if (defaultSetting?.value) {
        productId = parseInt(defaultSetting.value);
        console.log('Using default_product_id from settings:', productId);
      }
    }

    if (!productId) {
      console.log('No valid product_id found');
      return NextResponse.json({
        products: [],
        total: 0,
        category_id: categoryId
      });
    }

    // Find the parent category (like Rails logic)
    const parent = await prisma.products.findUnique({
      where: { 
        id: productId,
        deleted_at: null 
      }
    });

    if (!parent) {
      console.log('Parent category not found for id:', productId);
      return NextResponse.json({
        products: [],
        total: 0,
        category_id: categoryId
      });
    }

    console.log('Found parent category:', parent.name, 'ancestry:', parent.ancestry);

    // Get children of this parent (like Rails: parent.children.available)
    const expectedAncestry = parent.ancestry ? `${parent.ancestry}/${productId}` : `${productId}`;
    console.log('Looking for children with ancestry:', expectedAncestry);

    // Get products with their images from ActiveStorage
    const products = await prisma.products.findMany({
      where: {
        ancestry: expectedAncestry,
        deleted_at: null, // available products
        show_in_webapp: true, // только товары для показа в webapp
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
      // Rails sorts by: stock_quantity: :desc, created_at: :desc
      orderBy: [
        { stock_quantity: 'desc' },
        { created_at: 'desc' }
      ]
    });

    console.log('Found products count:', products.length);

    // Get images for all products in one query
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

    // Create a map of product_id -> blob_key
    const imageMap = new Map<number, string>();
    attachments.forEach(attachment => {
      imageMap.set(Number(attachment.record_id), attachment.active_storage_blobs.key);
    });

    // Transform the data to match the expected format
    const transformedProducts = products.map((product: any) => {
      const productId = Number(product.id);
      const blobKey = imageMap.get(productId);
      
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
        image_url: imageUrl,
        image_url_fallback: blobKey ? S3Service.getOldImageUrl(blobKey) : undefined,
      };
    });

    console.log('Returning products with images:', transformedProducts.length);

    const result = {
      products: transformedProducts,
      total: transformedProducts.length,
      category_id: categoryId,
      parent_category: {
        id: productId,
        name: parent.name
      }
    };

    // 🚀 СОХРАНЯЕМ В КЭШ НА 5 МИНУТ
    await RedisService.setCache(cacheKey, result, 300);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products', 
        details: error instanceof Error ? error.message : String(error),
        products: [],
        total: 0
      },
      { status: 500 }
    );
  }
} 