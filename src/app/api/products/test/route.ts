import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test Products API: Starting...');
    
    // Получаем первые 5 товаров для тестирования
    const products = await prisma.products.findMany({
      where: {
        deleted_at: null,
        is_visible: true
      },
      take: 5,
      orderBy: {
        id: 'asc'
      }
    });

    console.log('🧪 Test Products API: Found', products.length, 'products');

    // Простейшая обработка без агрегаций
    const simpleProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      prime_cost: product.prime_cost ? Number(product.prime_cost.toString()) : 0,
      avgpurchasepricerub: product.avgpurchasepricerub ? Number(product.avgpurchasepricerub.toString()) : 0,
      price: product.price ? Number(product.price.toString()) : 0,
      stock_quantity: product.stock_quantity || 0,
      // Простой расчет себестоимости в лирах (курс 2.02)
      avgPurchasePriceTry: product.avgpurchasepricerub 
        ? Number(product.avgpurchasepricerub.toString()) / 2.02
        : product.prime_cost 
          ? Number(product.prime_cost.toString()) / 2.02 
          : 0,
      inTransitQuantity: 0 // Пока без агрегаций
    }));

    console.log('🧪 Test Products API: Processed data:', simpleProducts);

    return NextResponse.json({
      success: true,
      data: {
        products: simpleProducts,
        total: simpleProducts.length
      }
    });
  } catch (error) {
    console.error('❌ Test Products API Error:', error);
    return NextResponse.json(
      { 
        error: 'Test API Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 