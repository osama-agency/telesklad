import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';
import { Decimal } from '@prisma/client/runtime/library';

// GET - получение списка закупок
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - создание новой закупки
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, totalAmount, isUrgent, expenses, currency = 'TRY' } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    if (!totalAmount || typeof totalAmount !== 'number') {
      return NextResponse.json({ error: 'Total amount is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Начинаем транзакцию для атомарности операций
    const purchase = await prisma.$transaction(async (tx) => {
      // Создаем закупку
      const newPurchase = await tx.purchase.create({
        data: {
          totalAmount,
          isUrgent: Boolean(isUrgent),
          expenses: expenses || null,
          userId: user.id,
          items: {
            create: items.map((item: any) => ({
              quantity: item.quantity,
              costPrice: item.costPrice,
              total: item.total,
              productId: item.productId,
              productName: item.productName
            }))
          }
        },
        include: {
          items: true
        }
      });

      // Обновляем среднюю закупочную цену и количество для каждого товара
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }

        // Конвертируем цену в рубли
        const priceInRub = await ExchangeRateService.convertToRub(
          item.costPrice,
          currency,
          new Date()
        );

        // Рассчитываем новую среднюю цену
        const currentStock = product.stock_quantity || 0;
        const currentAvgPrice = product.avgPurchasePriceRub ? Number(product.avgPurchasePriceRub) : 0;
        
        const newAvgPrice = ExchangeRateService.calculateMovingAverage(
          currentStock,
          currentAvgPrice,
          item.quantity,
          priceInRub
        );

        // Обновляем товар
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock_quantity: currentStock + item.quantity,
            avgPurchasePriceRub: new Decimal(newAvgPrice),
            // Обновляем prime_cost для обратной совместимости
            prime_cost: new Decimal(newAvgPrice)
          }
        });
      }

      return newPurchase;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No exchange rate found')) {
        return NextResponse.json(
          { error: 'Exchange rate not found. Please update exchange rates first.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Product with id')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 