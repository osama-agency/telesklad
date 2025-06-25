import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';
import { CurrencyConverterService } from '@/lib/services/currency-converter.service';
import { Decimal } from '@prisma/client/runtime/library';

// Функция для рекурсивной конвертации BigInt в строки
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }
  
  return obj;
}

// GET - получение списка закупок с фильтрами
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

    // 🔍 НОВЫЕ ФИЛЬТРЫ
    const urgent = searchParams.get('urgent'); // true/false
    const status = searchParams.get('status'); // draft, sent, paid, in_transit, received, cancelled
    const search = searchParams.get('search'); // поиск по названию товара или поставщику
    const dateFrom = searchParams.get('dateFrom'); // фильтр по дате создания (от)
    const dateTo = searchParams.get('dateTo'); // фильтр по дате создания (до)
    const minAmount = searchParams.get('minAmount'); // минимальная сумма
    const maxAmount = searchParams.get('maxAmount'); // максимальная сумма
    const sortBy = searchParams.get('sortBy') || 'createdat'; // поле сортировки
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // направление сортировки

    // Строим условия фильтрации
    const whereConditions: any = {};

    // Фильтр по срочности
    if (urgent !== null) {
      whereConditions.isurgent = urgent === 'true';
    }

    // Фильтр по статусу
    if (status) {
      whereConditions.status = status;
    }

    // Фильтр по дате создания
    if (dateFrom || dateTo) {
      whereConditions.createdat = {};
      if (dateFrom) {
        whereConditions.createdat.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereConditions.createdat.lte = new Date(dateTo);
      }
    }

    // Фильтр по сумме
    if (minAmount || maxAmount) {
      whereConditions.totalamount = {};
      if (minAmount) {
        whereConditions.totalamount.gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        whereConditions.totalamount.lte = parseFloat(maxAmount);
      }
    }

    // Поиск по тексту (поставщик или товары)
    if (search) {
      whereConditions.OR = [
        {
          suppliername: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          notes: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          purchase_items: {
            some: {
              productname: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        }
      ];
    }

    // Настройка сортировки
    const orderBy: any = {};
    if (sortBy === 'totalAmount') {
      orderBy.totalamount = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else if (sortBy === 'isUrgent') {
      orderBy.isurgent = sortOrder;
    } else {
      orderBy.createdat = sortOrder;
    }

    console.log('🔍 Applied filters:', {
      urgent,
      status,
      search,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder
    });

    // ✅ ИСПРАВЛЕНИЕ N+1: Используем include для загрузки связанных данных одним запросом
    try {
      console.log('🔍 About to query purchases with conditions:', JSON.stringify(whereConditions, null, 2));
      console.log('🔍 Order by:', JSON.stringify(orderBy, null, 2));
      console.log('🔍 Pagination: offset =', offset, ', limit =', limit);
      
      const [purchases, totalCount] = await Promise.all([
        (prisma as any).purchases.findMany({
          where: whereConditions,
          orderBy: orderBy,
          skip: offset,
          take: limit,
          include: {
            purchase_items: {
              include: {
                products: {
                  select: {
                    id: true,
                    name: true,
                    prime_cost: true
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
          }
        }),
        (prisma as any).purchases.count({ where: whereConditions })
      ]);

      console.log('✅ Raw purchases from DB:', purchases.length);
      console.log('✅ Total count from DB:', totalCount);
      
      if (purchases.length > 0) {
        console.log('✅ First purchase sample: Found data structure');
      }

      // ✅ Используем новый сервис конвертации валют для правильной обработки
      console.log('🔄 Converting purchases using CurrencyConverterService...');
      const serializedPurchases = await CurrencyConverterService.convertPurchasesBatch(purchases);

      // Рассчитываем средневзвешенный курс для аналитики
      const totalRubForAnalytics = serializedPurchases.reduce((sum, p) => sum + (p.totalAmountRub || 0), 0);
      const totalTryForAnalytics = serializedPurchases.reduce((sum, p) => {
        const rate = p.exchangeRate || 1; // 1 - для избежания деления на ноль
        return sum + ((p.totalAmountRub || 0) / rate);
      }, 0);
      
      const averageExchangeRate = totalTryForAnalytics > 0 ? totalRubForAnalytics / totalTryForAnalytics : null;

      console.log(`✅ Purchases API: Found ${serializedPurchases.length} purchases (filtered from ${totalCount} total)`);
      
      // Применяем сериализацию BigInt ко всем данным
      const responseData = serializeBigInt({
        purchases: serializedPurchases,
        analytics: {
          averageExchangeRate
        },
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        },
        filters: {
          urgent,
          status,
          search,
          dateFrom,
          dateTo,
          minAmount,
          maxAmount,
          sortBy,
          sortOrder
        }
      });
      
      return NextResponse.json(responseData);
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
        },
        filters: {
          urgent,
          status,
          search,
          dateFrom,
          dateTo,
          minAmount,
          maxAmount,
          sortBy,
          sortOrder
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

    const { items, totalAmount, isUrgent, expenses, currency = 'RUB', supplierName, notes } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    if (!totalAmount || typeof totalAmount !== 'number') {
      return NextResponse.json({ error: 'Total amount is required' }, { status: 400 });
    }

    console.log(`💰 Creating purchase with currency: ${currency}, total: ${totalAmount}`);

    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ - используем дефолтного пользователя
    const user = await (prisma as any).telesklad_users.findFirst({
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

    // Получаем текущий курс валюты для TRY
    let currentExchangeRate = null;
    let totalCostTry = null;

    if (currency === 'TRY') {
      try {
        console.log('📈 Getting current TRY exchange rate...');
        const exchangeRateData = await ExchangeRateService.getLatestRate('TRY');
        currentExchangeRate = Number(exchangeRateData.rateWithBuffer);
        totalCostTry = totalAmount; // В лирах
        console.log(`📈 Current TRY rate: ${currentExchangeRate}, Total in TRY: ${totalCostTry}`);
      } catch (error) {
        console.log('⚠️ Failed to get TRY exchange rate:', error);
        // Продолжаем без курса, но логируем предупреждение
      }
    }

    // Начинаем транзакцию для атомарности операций
    const purchase = await prisma.$transaction(async (tx) => {
      // Создаем закупку с сохранением курса валюты
      const purchaseData: any = {
        totalamount: totalAmount,
        isurgent: Boolean(isUrgent),
        expenses: expenses || null,
        userid: mainUser.id, // Используем ID из таблицы users
        suppliername: supplierName || null,
        notes: notes || null,
      };

      // Добавляем данные о валюте если это TRY
      if (currency === 'TRY' && currentExchangeRate && totalCostTry) {
        purchaseData.exchangerate = new Decimal(currentExchangeRate);
        purchaseData.totalcosttry = new Decimal(totalCostTry);
        console.log(`💱 Saving exchange rate: ${currentExchangeRate} and total TRY: ${totalCostTry}`);
      }

      const newPurchase = await (tx as any).purchases.create({
        data: purchaseData
      });

      // Создаем элементы закупки - цены сохраняются как есть (в рублях)
      const purchaseItems = [];
      for (const item of items) {
        const purchaseItem = await (tx as any).purchase_items.create({
          data: {
            purchaseid: newPurchase.id,
            quantity: parseInt(item.quantity),
            costprice: parseFloat(item.costPrice), // Цена в рублях
            total: parseFloat(item.total), // Итого в рублях
            productid: parseInt(item.productId),
            productname: item.productName || `Product ${item.productId}`
          }
        });
        purchaseItems.push(purchaseItem);
      }

      // Обновляем среднюю закупочную цену и количество для каждого товара
      // ВАЖНО: Цены уже в рублях, конвертация не нужна
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
          // Цена уже в рублях - используем как есть
          const priceInRub = parseFloat(item.costPrice);

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
              // prime_cost оставляем как есть - он будет обновлен при оплате закупки
            }
          });

          console.log(`📦 Updated product ${productId}: stock +${item.quantity}, avg price: ${newAvgPrice.toFixed(2)} RUB`);
        } catch (updateError) {
          console.log(`⚠️ Failed to update product ${productId} prices:`, updateError);
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

    console.log(`✅ Purchase created successfully with ID: ${purchase.id}, currency: ${currency}`);

    return NextResponse.json(serializedPurchase, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      
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