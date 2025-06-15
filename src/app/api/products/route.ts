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

    // Обновляем товары в локальной базе
    for (const extProduct of externalProducts) {
      await prisma.product.upsert({
        where: { id: extProduct.id },
        update: {
          name: extProduct.name,
          description: extProduct.description,
          price: extProduct.price ? parseFloat(extProduct.price) : null,
          prime_cost: extProduct.prime_cost ? parseFloat(extProduct.prime_cost) : null,
          stock_quantity: extProduct.stock_quantity,
          updated_at: new Date(),
          deleted_at: extProduct.deleted_at ? new Date(extProduct.deleted_at) : null,
          ancestry: extProduct.ancestry,
          weight: extProduct.weight,
          dosage_form: extProduct.dosage_form,
          package_quantity: extProduct.package_quantity,
          main_ingredient: extProduct.main_ingredient,
          brand: extProduct.brand,
          old_price: extProduct.old_price ? parseFloat(extProduct.old_price) : null,
        },
        create: {
          id: extProduct.id,
          name: extProduct.name,
          description: extProduct.description,
          price: extProduct.price ? parseFloat(extProduct.price) : null,
          prime_cost: extProduct.prime_cost ? parseFloat(extProduct.prime_cost) : null,
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
          old_price: extProduct.old_price ? parseFloat(extProduct.old_price) : null,
          is_visible: true, // По умолчанию товары видимы
        },
      });
    }

    return externalProducts.length;
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
      totalExpenses = expensesData._sum.amount || 0;
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
        const revenue = Number(salesData._sum.total || 0);

        // Рассчитываем расходы
        const costPrice = product.avgPurchasePriceRub ? Number(product.avgPurchasePriceRub) : Number(product.prime_cost || 0);
        const baseCost = costPrice * soldQuantity; // базовая себестоимость
        
        // Доля общих расходов пропорционально продажам
        const expenseShare = totalSoldQuantity > 0 ? (soldQuantity / totalSoldQuantity) * totalExpenses : 0;
        
        // Фиксированная стоимость доставки (350₽ за штуку)
        const deliveryCost = soldQuantity * 350;
        
        // Общие расходы
        const totalCosts = baseCost + expenseShare + deliveryCost;
        
        // Чистая прибыль с 1 штуки
        const netProfitPerUnit = soldQuantity > 0 ? (revenue - totalCosts) / soldQuantity : 0;

        return {
          ...product,
          soldQuantity, // количество проданных штук
          revenue, // общая выручка
          baseCost, // себестоимость
          expenseShare, // доля общих расходов
          deliveryCost, // стоимость доставки
          totalCosts, // общие расходы
          netProfitPerUnit, // чистая прибыль с 1 шт
        };
      })
    );

    console.log('🛍️ Products API: Successfully processed', productsWithSales.length, 'products');
    return NextResponse.json(productsWithSales);
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
        price: productData.price ? parseFloat(productData.price) : null,
        prime_cost: productData.prime_cost ? parseFloat(productData.prime_cost) : null,
        stock_quantity: productData.stock_quantity,
        ancestry: productData.ancestry,
        weight: productData.weight,
        dosage_form: productData.dosage_form,
        package_quantity: productData.package_quantity,
        main_ingredient: productData.main_ingredient,
        brand: productData.brand,
        old_price: productData.old_price ? parseFloat(productData.old_price) : null,
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