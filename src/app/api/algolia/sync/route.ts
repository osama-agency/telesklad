import { NextRequest, NextResponse } from 'next/server';
import { AlgoliaService } from '@/lib/services/algolia.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting Algolia sync...');

    // Получаем все товары из базы данных
    const products = await prisma.products.findMany({
      where: {
        show_in_webapp: true,
        deleted_at: null
      }
    });

    console.log(`📦 Found ${products.length} products to sync`);

    // Синхронизируем с Algolia используя новый метод
    const result = await AlgoliaService.syncProductsFromDatabase(products);

    console.log('✅ Algolia sync completed');

    return NextResponse.json({
      success: true,
      message: 'Products synced successfully',
      syncedCount: products.length,
      algoliaResult: result
    });

  } catch (error) {
    console.error('❌ Algolia sync failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to sync products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Возвращаем статус синхронизации
    const productsCount = await prisma.products.count({
      where: {
        show_in_webapp: true,
        deleted_at: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Algolia sync status',
      availableProducts: productsCount,
      algoliaIndex: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PRODUCTS || 'nextadmin_products',
      algoliaConfigured: !!(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID && process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY)
    });

  } catch (error) {
    console.error('❌ Failed to get sync status:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get sync status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 