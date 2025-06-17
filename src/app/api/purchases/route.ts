import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';
import { Decimal } from '@prisma/client/runtime/library';

// GET - получение списка закупок
export async function GET(request: NextRequest) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🔧 Purchases API: Starting...');

    // Пробуем разные варианты названий таблиц
    let purchases = [];
    
    try {
      // Сначала пробуем purchases
      purchases = await (prisma as any).purchases.findMany({
        orderBy: {
          createdat: 'desc'
        },
        take: 10 // Ограничиваем количество для безопасности
      });
      console.log('✅ Found purchases table');
    } catch (purchasesError) {
      console.log('❌ purchases table not found:', purchasesError);
      
      try {
        // Пробуем purchase (единственное число)
        purchases = await (prisma as any).purchase.findMany({
          orderBy: {
            createdat: 'desc'
          },
          take: 10
        });
        console.log('✅ Found purchase table');
      } catch (purchaseError) {
        console.log('❌ purchase table not found:', purchaseError);
        
        // Возвращаем пустой массив если таблицы нет
        console.log('📝 Returning empty purchases array');
        return NextResponse.json([]);
      }
    }

    // Загружаем элементы закупки для каждой закупки
    const serializedPurchases = await Promise.all(purchases.map(async (purchase: any) => {
      let items = [];
      try {
        const purchaseItems = await (prisma as any).purchase_items.findMany({
      where: {
            purchaseid: purchase.id
          }
        });
        
        items = purchaseItems.map((item: any) => ({
          id: item.id ? item.id.toString() : null,
          productId: item.productid ? item.productid.toString() : null,
          productName: item.productname || 'Unknown Product',
          quantity: item.quantity || 0,
          costPrice: item.costprice || 0,
          total: item.total || 0
        }));
      } catch (itemsError) {
        console.log('⚠️ Failed to load items for purchase', purchase.id, itemsError);
      }

      return {
        ...purchase,
        id: purchase.id ? purchase.id.toString() : null,
        user_id: purchase.user_id ? purchase.user_id.toString() : null,
        userid: purchase.userid ? purchase.userid.toString() : null,
        // Добавляем поля, которые ожидает фронтенд
        createdAt: purchase.createdat || purchase.created_at || new Date().toISOString(),
        updatedAt: purchase.updatedat || purchase.updated_at || new Date().toISOString(),
        totalAmount: purchase.totalamount || purchase.total_amount || 0,
        status: purchase.status || 'draft',
        isUrgent: purchase.isurgent || purchase.is_urgent || false,
        expenses: purchase.expenses || 0,
        items: items
      };
    }));

    console.log(`✅ Purchases API: Found ${serializedPurchases.length} purchases`);
    return NextResponse.json(serializedPurchases);
  } catch (error) {
    console.error('❌ Error fetching purchases:', error);
    // Возвращаем пустой массив вместо ошибки для стабильности UI
    return NextResponse.json([]);
  }
}

// POST - создание новой закупки
export async function POST(request: NextRequest) {
  try {
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { items, totalAmount, isUrgent, expenses, currency = 'TRY' } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    if (!totalAmount || typeof totalAmount !== 'number') {
      return NextResponse.json({ error: 'Total amount is required' }, { status: 400 });
    }

    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ - используем дефолтного пользователя
    const user = await (prisma as any).telesklad_user.findFirst({
      where: { email: 'go@osama.agency' }
    });

    if (!user) {
      return NextResponse.json({ error: 'Default user not found' }, { status: 404 });
    }

    // Находим соответствующего пользователя в таблице users по email
    const mainUser = await (prisma as any).users.findFirst({
      where: { email: 'go@osama.agency' }
    });

    if (!mainUser) {
      return NextResponse.json({ error: 'Main user not found in users table' }, { status: 404 });
    }

    // Начинаем транзакцию для атомарности операций
    const purchase = await prisma.$transaction(async (tx) => {
      // Создаем закупку
      const newPurchase = await (tx as any).purchases.create({
        data: {
          totalamount: totalAmount,
          isurgent: Boolean(isUrgent),
          expenses: expenses || null,
          userid: mainUser.id, // Используем ID из таблицы users
        }
      });

      // Создаем элементы закупки
      const purchaseItems = [];
      for (const item of items) {
        const purchaseItem = await (tx as any).purchase_items.create({
          data: {
            purchaseid: newPurchase.id,
            quantity: parseInt(item.quantity),
            costprice: parseFloat(item.costPrice),
            total: parseFloat(item.total),
            productid: parseInt(item.productId),
            productname: item.productName || `Product ${item.productId}`
          }
        });
        purchaseItems.push(purchaseItem);
      }

      // Обновляем среднюю закупочную цену и количество для каждого товара
      for (const item of items) {
        const productId = parseInt(item.productId);
        const product = await (tx as any).products.findUnique({
          where: { id: productId }
        });

        if (!product) {
          console.log(`⚠️ Product with id ${productId} not found, skipping stock update`);
          continue; // Пропускаем, если товар не найден
        }

        try {
        // Конвертируем цену в рубли
        const priceInRub = await ExchangeRateService.convertToRub(
            parseFloat(item.costPrice),
          currency,
          new Date()
        );

        // Рассчитываем новую среднюю цену
        const currentStock = product.stock_quantity || 0;
          const currentAvgPrice = product.avgpurchasepricerub ? Number(product.avgpurchasepricerub) : 0;
        
        const newAvgPrice = ExchangeRateService.calculateMovingAverage(
          currentStock,
          currentAvgPrice,
            parseInt(item.quantity),
          priceInRub
        );

        // Обновляем товар
          await (tx as any).products.update({
            where: { id: productId },
          data: {
              stock_quantity: currentStock + parseInt(item.quantity),
              avgpurchasepricerub: new Decimal(newAvgPrice),
            // Обновляем prime_cost для обратной совместимости
            prime_cost: new Decimal(newAvgPrice)
          }
        });
        } catch (exchangeError) {
          console.log(`⚠️ Failed to update product ${productId} prices:`, exchangeError);
          // Продолжаем выполнение, даже если не удалось обновить цены
        }
      }

      return {
        ...newPurchase,
        items: purchaseItems
      };
    });

    // Преобразуем BigInt поля в строки для JSON сериализации
    const serializedPurchase = {
      ...purchase,
      id: purchase.id.toString(),
      userid: purchase.userid ? purchase.userid.toString() : null,
      items: purchase.items?.map((item: any) => ({
        ...item,
        id: item.id.toString(),
        purchaseid: item.purchaseid ? item.purchaseid.toString() : null,
        productid: item.productid ? item.productid.toString() : null,
      })) || [],
    };

    return NextResponse.json(serializedPurchase, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      
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
      
      // Возвращаем более подробную ошибку для отладки
      return NextResponse.json({ 
        error: 'Internal Server Error', 
        details: error.message,
        type: error.constructor.name 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 