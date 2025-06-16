import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Simple Products API: Starting...');
    
    // const session = await getServerSession();
    
    // if (!session?.user?.email) {
    //   console.log('❌ Simple Products API: Unauthorized');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🔧 Simple Products API: Fetching products...');
    
    // Простейший запрос без joins и агрегаций - только товары (ancestry содержит "/")
    const products = await (prisma as any).products.findMany({
      where: {
        deleted_at: null,
        is_visible: true,
        ancestry: {
          contains: '/' // только настоящие товары, не категории
        }
      },
      select: {
        id: true,
        name: true,
        prime_cost: true,
        avgpurchasepricerub: true,
        price: true,
        stock_quantity: true
      },
      take: 20,
      orderBy: {
        name: 'asc'
      }
    });

    console.log('🔧 Simple Products API: Found', products.length, 'products');

    // Получаем актуальный курс лиры с буфером (+5%)
    let tryRateWithBuffer = 2.02; // Fallback курс
    try {
      const latestRate = await ExchangeRateService.getLatestRate('TRY');
      tryRateWithBuffer = Number(latestRate.rateWithBuffer);
      console.log(`💱 Using TRY rate with buffer: ${tryRateWithBuffer} RUB per TRY`);
    } catch (error) {
      console.log(`⚠️ Could not get TRY rate, using fallback: ${tryRateWithBuffer}`);
    }

    const simpleProducts = products.map((product: any) => {
      const primePrice = product.prime_cost ? Number(product.prime_cost.toString()) : 0;
      const avgPrice = product.avgpurchasepricerub ? Number(product.avgpurchasepricerub.toString()) : 0;
      
      // Себестоимость в лирах (prime_cost)
      const primeCostTry = primePrice;
      
      // Цена в рублях = себестоимость в лирах * курс лиры с буфером (+5%)
      const priceInRub = primeCostTry > 0 ? primeCostTry * tryRateWithBuffer : 0;
      
      console.log(`💰 ${product.name}: Prime cost ₺${primeCostTry} → Price ${priceInRub.toFixed(0)} RUB (rate: ${tryRateWithBuffer})`);
      
      return {
        id: product.id.toString(), // Преобразуем BigInt в строку
        name: product.name,
        prime_cost: primeCostTry, // Себестоимость в лирах
        priceInRub: priceInRub, // Цена в рублях (себестоимость + 5%)
        avgpurchasepricerub: avgPrice, // Средняя цена в рублях (старая)
        avgCostInTry: primeCostTry, // Для обратной совместимости
        inTransit: 0 // Пока упрощенно
      };
    });

    console.log('🔧 Simple Products API: Processed', simpleProducts.length, 'products');

    return NextResponse.json({
      success: true,
      data: {
        products: simpleProducts,
        total: simpleProducts.length
      }
    });

  } catch (error) {
    console.error('❌ Simple Products API Error:', error);
    return NextResponse.json(
      { 
        error: 'Simple API Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 