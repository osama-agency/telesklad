import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { RedisService } from '@/lib/services/redis.service';

export async function GET() {
  try {
    // 🚀 ДОБАВЛЯЕМ КЭШИРОВАНИЕ
    const cacheKey = 'webapp:categories';
    const cached = await RedisService.getCache(cacheKey);
    
    if (cached) {
      console.log('✅ Categories from cache');
      return NextResponse.json(cached);
    }
    
    console.log('Categories API called');
    
    // Get root_product_id from settings (like Rails available_categories method)
    const rootSetting = await prisma.settings.findUnique({
      where: { variable: 'root_product_id' }
    });

    if (!rootSetting?.value) {
      console.log('No root_product_id found in settings');
      return NextResponse.json({
        categories: [],
        total: 0
      });
    }

    const rootProductId = parseInt(rootSetting.value);
    console.log('Using root_product_id:', rootProductId);

    // Find the root product
    const rootProduct = await prisma.products.findUnique({
      where: { 
        id: rootProductId,
        deleted_at: null 
      }
    });

    if (!rootProduct) {
      console.log('Root product not found');
      return NextResponse.json({
        categories: [],
        total: 0
      });
    }

    // Get children of root product (categories) - like Rails: find(root_id).children.available
    const expectedAncestry = rootProduct.ancestry ? `${rootProduct.ancestry}/${rootProductId}` : `${rootProductId}`;
    console.log('Looking for categories with ancestry:', expectedAncestry);

    const categories = await prisma.products.findMany({
      where: {
        ancestry: expectedAncestry,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        ancestry: true,
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    console.log('Found categories count:', categories.length);

    // Transform the data to match the expected format
    const transformedCategories = categories
      .filter(category => category.name) // Only categories with names
      .map((category: any) => ({
        id: Number(category.id), // Convert BigInt to Number
        name: category.name,
      }));

    console.log('Returning categories:', transformedCategories.length);
    
    const result = {
      categories: transformedCategories,
      total: transformedCategories.length,
      root_category: {
        id: rootProductId,
        name: rootProduct.name
      }
    };
    
    // 🚀 СОХРАНЯЕМ В КЭШ НА 1 ЧАС (категории редко меняются)
    await RedisService.setCache(cacheKey, result, 3600);
    
    // Возвращаем в правильном формате для компонентов
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories', 
        details: error instanceof Error ? error.message : String(error),
        categories: [],
        total: 0
      },
      { status: 500 }
    );
  }
}
