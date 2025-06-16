import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

// PUT - обновление цены в лирах
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { priceTRY } = await request.json();

    // Валидация
    if (typeof priceTRY !== 'number' || priceTRY < 0) {
      return NextResponse.json({ error: 'Invalid price value' }, { status: 400 });
    }

    // Если это prime_cost, обновляем его
    const productId = parseInt(id);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { avgPurchasePriceTRY: true, prime_cost: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Если нет средней цены в лирах, обновляем prime_cost
    let updateData: any = {};
    
    if (!product.avgPurchasePriceTRY || Number(product.avgPurchasePriceTRY) === 0) {
      // Обновляем prime_cost в лирах (конвертируем в рубли для хранения)
      // Получаем курс валют
      const exchangeRate = await prisma.exchangeRate.findFirst({
        where: { currency: 'TRY' },
        orderBy: { effectiveDate: 'desc' }
      });

      if (exchangeRate) {
        const rate = Number(exchangeRate.rateWithBuffer); // с буфером 5%
        const priceInRub = priceTRY * rate;
        updateData.prime_cost = priceInRub;
      }
    } else {
      // Обновляем среднюю цену в лирах
      updateData.avgPurchasePriceTRY = priceTRY;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...updateData,
        updated_at: new Date(),
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedProduct,
      message: 'Цена в лирах обновлена'
    });

  } catch (error) {
    console.error('Error updating TRY price:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 