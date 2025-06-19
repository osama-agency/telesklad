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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // ✅ ИСПРАВЛЕНИЕ N+1: Используем include для загрузки связанных данных одним запросом
    try {
      const [purchases, totalCount] = await Promise.all([
        (prisma as any).purchases.findMany({
          include: {
            purchase_items: {
              include: {
                products: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            users: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true
              }
            }
          },
          orderBy: {
            createdat: 'desc'
          },
          skip: offset,
          take: limit
        }),
        (prisma as any).purchases.count()
      ]);

      console.log('✅ Found purchases table');

      // Сериализуем данные без дополнительных запросов
      const serializedPurchases = purchases.map((purchase: any) => {
        const items = purchase.purchase_items?.map((item: any) => ({
          id: item.id ? String(item.id) : null,
          productId: item.productid ? String(item.productid) : null,
          productName: item.productname || item.products?.name || 'Unknown Product',
          quantity: item.quantity || 0,
          costPrice: item.costprice || 0,
          total: item.total || 0,
          totalCostRub: item.totalcostrub ? Number(item.totalcostrub) : null,
          totalCostTry: item.totalcosttry ? Number(item.totalcosttry) : null,
          unitCostRub: item.unitcostrub ? Number(item.unitcostrub) : null,
          unitCostTry: item.unitcosttry ? Number(item.unitcosttry) : null
        })) || [];

        return {
          id: purchase.id ? String(purchase.id) : null,
          userid: purchase.userid ? String(purchase.userid) : null,
          // Добавляем поля, которые ожидает фронтенд
          createdAt: purchase.createdat || purchase.created_at || new Date().toISOString(),
          updatedAt: purchase.updatedat || purchase.updated_at || new Date().toISOString(),
          totalAmount: Number(purchase.totalamount || purchase.total_amount || 0),
          status: purchase.status || 'draft',
          isUrgent: Boolean(purchase.isurgent || purchase.is_urgent || false),
          expenses: Number(purchase.expenses || 0),
          items: items,
          // Информация о пользователе
          user: purchase.users ? {
            id: String(purchase.users.id),
            email: purchase.users.email,
            firstName: purchase.users.first_name,
            lastName: purchase.users.last_name
          } : null,
          // Дополнительные поля для Telegram
          telegramMessageId: purchase.telegrammessageid ? String(purchase.telegrammessageid) : null,
          telegramChatId: purchase.telegramchatid ? String(purchase.telegramchatid) : null,
          supplierName: purchase.suppliername || null,
          supplierPhone: purchase.supplierphone || null,
          supplierAddress: purchase.supplieraddress || null,
          notes: purchase.notes || null,
          deliveryDate: purchase.deliverydate || null,
          deliveryTrackingNumber: purchase.deliverytrackingnumber || null,
          deliveryStatus: purchase.deliverystatus || null,
          deliveryCarrier: purchase.deliverycarrier || null,
          deliveryNotes: purchase.deliverynotes || null,
          paymentButtonClicks: Number(purchase.paymentbuttonclicks || 0)
        };
      });

      console.log(`✅ Purchases API: Found ${serializedPurchases.length} purchases`);
      
      return NextResponse.json({
        purchases: serializedPurchases,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      });
    } catch (purchasesError) {
      console.log('❌ purchases table not found:', purchasesError);
      console.log('📝 Returning empty purchases array');
      return NextResponse.json({
        purchases: [],
        pagination: {
          page: 1,
          limit: 50,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }
  } catch (error) {
    console.error('❌ Error fetching purchases:', error);
    // Возвращаем пустой массив вместо ошибки для стабильности UI
    return NextResponse.json({
      purchases: [],
      pagination: {
        page: 1,
        limit: 50,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
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
            // prime_cost должен храниться в лирах - конвертируем из рублей
            prime_cost: new Decimal(await ExchangeRateService.convertFromRub(newAvgPrice, currency, new Date()))
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