import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

const STRATTERA_API_URL = 'https://strattera.tgapp.online/api/v1/products';
const STRATTERA_TOKEN = '8cM9wVBrY3p56k4L1VBpIBwOsw';

// Функция синхронизации товаров из внешнего API в локальную базу
async function syncProductsFromAPI() {
  try {
    // Запрос к внешнему API Strattera
    const response = await fetch(STRATTERA_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': STRATTERA_TOKEN, // Без "Bearer" префикса
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Strattera API error: ${response.status}`);
    }

    const externalProducts = await response.json();

    // Фильтруем категории (где ancestry is null или не содержит /)
    const productsOnly = externalProducts.filter((p: any) => p.ancestry && p.ancestry.includes('/'));

    console.log(`Синхронизация: получено ${externalProducts.length} записей, из них ${productsOnly.length} являются товарами.`);

    // Обновляем товары в локальной базе
    for (const extProduct of productsOnly) {
      await prisma.product.upsert({
        where: { id: extProduct.id },
        update: {
          name: extProduct.name,
          description: extProduct.description,
          price: extProduct.price ? Number(extProduct.price) : null,
          prime_cost: extProduct.prime_cost ? Number(extProduct.prime_cost) : null,
          stock_quantity: extProduct.stock_quantity,
          updated_at: new Date(),
          deleted_at: extProduct.deleted_at ? new Date(extProduct.deleted_at) : null,
          ancestry: extProduct.ancestry,
          weight: extProduct.weight,
          dosage_form: extProduct.dosage_form,
          package_quantity: extProduct.package_quantity,
          main_ingredient: extProduct.main_ingredient,
          brand: extProduct.brand,
          old_price: extProduct.old_price ? Number(extProduct.old_price) : null,
        },
        create: {
          id: extProduct.id,
          name: extProduct.name,
          description: extProduct.description,
          price: extProduct.price ? Number(extProduct.price) : null,
          prime_cost: extProduct.prime_cost ? Number(extProduct.prime_cost) : null,
          stock_quantity: extProduct.stock_quantity,
          created_at: extProduct.created_at ? new Date(extProduct.created_at) : new Date(),
          updated_at: extProduct.updated_at ? new Date(extProduct.updated_at) : new Date(),
          deleted_at: extProduct.deleted_at ? new Date(extProduct.deleted_at) : null,
          ancestry: extProduct.ancestry,
          weight: extProduct.weight,
          dosage_form: extProduct.dosage_form,
          package_quantity: extProduct.package_quantity,
          main_ingredient: extProduct.main_ingredient,
          brand: extProduct.brand,
          old_price: extProduct.old_price ? Number(extProduct.old_price) : null,
          is_visible: true, // По умолчанию товары видимы
        },
      });
    }

    return productsOnly.length;
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
}

// GET - получение товаров из локальной базы с синхронизацией
export async function GET(request: NextRequest) {
  try {
    console.log('🛍️ Products API: Starting request...');
    
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      console.log('❌ Products API: Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const showHidden = searchParams.get('showHidden') === 'true';
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
    console.log('🛍️ Products API: Params -', { showHidden, fromDate, toDate });

    // Временно отключаем синхронизацию для диагностики
    // await syncProductsFromAPI();

    // Строим условия фильтрации
    const whereConditions: any = {
      deleted_at: null,
    };

    // Фильтрация по видимости товаров
    if (showHidden) {
      // Показываем ТОЛЬКО скрытые товары
      whereConditions.is_visible = false;
    } else {
      // Показываем только видимые товары
      whereConditions.is_visible = true;
    }

    // Возвращаем товары согласно фильтрам
    console.log('🛍️ Products API: Fetching products with conditions:', whereConditions);
    const products = await prisma.product.findMany({
      where: whereConditions,
      orderBy: {
        name: 'asc'
      }
    });
    console.log('🛍️ Products API: Found', products.length, 'products');

    // Получаем общие расходы за период
    let totalExpenses = 0;
    let totalSoldQuantity = 0;

    if (fromDate && toDate) {
      // Преобразуем даты в строки для сравнения с полем date типа String
      const fromDateStr = new Date(fromDate).toISOString().split('T')[0];
      const toDateStr = new Date(toDate).toISOString().split('T')[0];
      
      const expensesData = await prisma.expense.aggregate({
        where: {
          date: {
            gte: fromDateStr,
            lte: toDateStr,
          },
        },
        _sum: {
          amount: true,
        },
      });
      totalExpenses = expensesData._sum.amount ? Number(expensesData._sum.amount.toString()) : 0;
      console.log('🛍️ Products API: Total expenses:', totalExpenses);

      // Получаем общее количество проданных товаров за период
      const totalSalesData = await prisma.orderItem.aggregate({
        where: {
          order: {
            paidAt: {
              not: null
            },
            orderDate: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            }
          }
        },
        _sum: {
          quantity: true,
        },
      });
      totalSoldQuantity = totalSalesData._sum.quantity || 0;
      console.log('🛍️ Products API: Total sold quantity:', totalSoldQuantity);
    }

    // Получаем количество проданных товаров и рассчитываем расходы
    console.log('🛍️ Products API: Processing', products.length, 'products with sales data...');
    const productsWithSales = await Promise.all(
      products.map(async (product) => {
        // Условия для фильтрации по датам
        const dateFilter: any = {};
        if (fromDate && toDate) {
          const from = new Date(fromDate);
          const to = new Date(toDate);
          
          // Если это один и тот же день (разница меньше суток)
          if (Math.abs(to.getTime() - from.getTime()) < 24 * 60 * 60 * 1000) {
            // Устанавливаем начало дня для from и конец дня для to
            const startOfDay = new Date(from);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(to);
            endOfDay.setHours(23, 59, 59, 999);
            
            dateFilter.gte = startOfDay;
            dateFilter.lte = endOfDay;
          } else {
            // Обычный диапазон дат
            dateFilter.gte = from;
            dateFilter.lte = to;
          }
        } else {
          if (fromDate) {
            dateFilter.gte = new Date(fromDate);
          }
          if (toDate) {
            dateFilter.lte = new Date(toDate);
          }
        }

        // Считаем количество проданных штук для каждого товара с учетом периода
        const salesData = await prisma.orderItem.aggregate({
          where: {
            productId: product.id.toString(),
            order: {
              paidAt: {
                not: null // только оплаченные заказы (paid_at !== null)
              },
              ...(Object.keys(dateFilter).length > 0 && {
                orderDate: dateFilter
              })
            }
          },
          _sum: {
            quantity: true,
            total: true, // общая выручка с товара
          },
        });

        const soldQuantity = salesData._sum.quantity || 0;
        const revenue = salesData._sum.total ? Number(salesData._sum.total.toString()) : 0;

        // Рассчитываем расходы
        const avgPurchasePrice = product.avgPurchasePriceRub ? Number(product.avgPurchasePriceRub.toString()) : 0;
        const primePrice = product.prime_cost ? Number(product.prime_cost.toString()) : 0;
        const costPrice = avgPurchasePrice || primePrice;
        const baseCost = costPrice * soldQuantity; // базовая себестоимость
        
        // Доля общих расходов пропорционально продажам
        const expenseShare = totalSoldQuantity > 0 ? (soldQuantity / totalSoldQuantity) * totalExpenses : 0;
        
        // Фиксированная стоимость доставки (350₽ за штуку)
        const deliveryCost = soldQuantity * 350;
        
        // Общие расходы
        const totalCosts = baseCost + expenseShare + deliveryCost;
        
        // Чистая прибыль с 1 штуки
        const netProfitPerUnit = soldQuantity > 0 ? (revenue - totalCosts) / soldQuantity : 0;

        // НОВЫЕ РАСЧЕТЫ ДЛЯ АНАЛИЗА ОСТАТКОВ
        let avgConsumptionPerDay = 0;
        let recommendedOrderQuantity = 0;
        let daysUntilZero = 0;

        if (fromDate && toDate) {
          // Рассчитываем количество дней в выбранном периоде
          const from = new Date(fromDate);
          const to = new Date(toDate);
          const daysDifference = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          // Среднее потребление в день = проданное количество / количество дней
          avgConsumptionPerDay = daysDifference > 0 ? soldQuantity / daysDifference : 0;
          
          // Дни до нуля = текущие остатки / среднее потребление в день
          const currentStock = product.stock_quantity || 0;
          daysUntilZero = avgConsumptionPerDay > 0 ? Math.floor(currentStock / avgConsumptionPerDay) : (currentStock > 0 ? 999 : 0);
          
          // Рекомендованное количество для заказа (на 30 дней вперед)
          // Если потребление есть, заказываем на месяц + 20% запас
          // Если потребления нет, но остатки заканчиваются, заказываем минимум 10 штук
          if (avgConsumptionPerDay > 0) {
            const monthlyConsumption = avgConsumptionPerDay * 30;
            const safetyStock = monthlyConsumption * 0.2; // 20% запас
            recommendedOrderQuantity = Math.ceil(monthlyConsumption + safetyStock - currentStock);
            
            // Минимум 1 штука, если расчет показывает необходимость заказа
            if (recommendedOrderQuantity < 0) recommendedOrderQuantity = 0;
          } else if (currentStock <= 5) {
            // Если товар не продается, но остатки критически малы, рекомендуем минимальный заказ
            recommendedOrderQuantity = 10;
          }
        }

        return {
          ...product,
          // Конвертируем Decimal поля в числа
          price: product.price ? Number(product.price.toString()) : null,
          prime_cost: product.prime_cost ? Number(product.prime_cost.toString()) : null,
          avgPurchasePriceRub: product.avgPurchasePriceRub ? Number(product.avgPurchasePriceRub.toString()) : null,
          old_price: product.old_price ? Number(product.old_price.toString()) : null,
          soldQuantity, // количество проданных штук
          revenue, // общая выручка
          baseCost, // себестоимость
          expenseShare, // доля общих расходов
          deliveryCost, // стоимость доставки
          totalCosts, // общие расходы
          netProfitPerUnit, // чистая прибыль с 1 шт
          // НОВЫЕ ПОЛЯ
          avgConsumptionPerDay, // среднее потребление в день
          recommendedOrderQuantity, // рекомендованное количество для заказа
          daysUntilZero, // дней до нуля остатков
        };
      })
    );

    console.log('🛍️ Products API: Successfully processed', productsWithSales.length, 'products');
    return NextResponse.json({
      success: true,
      data: {
        products: productsWithSales,
        total: productsWithSales.length
      }
    });
  } catch (error) {
    console.error('❌ Products API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// POST - создание/обновление товара в локальной базе
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productData = await request.json();

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price ? Number(productData.price) : null,
        prime_cost: productData.prime_cost ? Number(productData.prime_cost) : null,
        stock_quantity: productData.stock_quantity,
        ancestry: productData.ancestry,
        weight: productData.weight,
        dosage_form: productData.dosage_form,
        package_quantity: productData.package_quantity,
        main_ingredient: productData.main_ingredient,
        brand: productData.brand,
        old_price: productData.old_price ? Number(productData.old_price) : null,
        is_visible: productData.is_visible !== undefined ? productData.is_visible : true,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 