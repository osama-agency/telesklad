import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { ExternalOrder, SyncResult } from '@/types/order';

const STRATTERA_API_URL = 'https://strattera.tgapp.online/api/v1/orders';
const STRATTERA_TOKEN = '8cM9wVBrY3p56k4L1VBpIBwOsw';

// Функция для парсинга строковых значений в числа
const parseDecimal = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Функция для парсинга дат в российском формате DD.MM.YYYY HH:mm:ss
const parseDate = (dateString: string): Date => {
  // Сначала проверяем российский формат DD.MM.YYYY HH:mm:ss
  const russianDateRegex = /^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/;
  const match = dateString.match(russianDateRegex);
  
  if (match) {
    const [, day, month, year, hours, minutes, seconds] = match;
    // Создаем дату в UTC
    const date = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1, // месяц в JS начинается с 0
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    ));
    return date;
  }
  
  // Если не российский формат, пробуем стандартный парсинг
  const date = new Date(dateString);
  
  // Если дата некорректна, возвращаем текущую дату
  return isNaN(date.getTime()) ? new Date() : date;
};

// Функция синхронизации заказов
async function syncOrdersFromAPI(dateFilter?: Date): Promise<SyncResult> {
  const startTime = Date.now();
  const result: SyncResult = {
    ordersProcessed: 0,
    ordersCreated: 0,
    ordersUpdated: 0,
    itemsProcessed: 0,
    errors: [],
    lastSyncAt: new Date(),
    duration: 0,
  };

  try {
    // Запрос к внешнему API
    const response = await fetch(STRATTERA_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': STRATTERA_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Strattera API error: ${response.status} ${response.statusText}`);
    }

    const externalOrders: ExternalOrder[] = await response.json();
    console.log(`Fetched ${externalOrders.length} orders from external API`);

    // Фильтруем заказы по дате, если указан фильтр
    const filteredOrders = dateFilter 
      ? externalOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= dateFilter;
        })
      : externalOrders;

    console.log(`Processing ${filteredOrders.length} orders (filtered: ${dateFilter ? 'yes' : 'no'})`);

    // Дата отсечки для автоматической простановки paidAt
    const cutoffDate = new Date('2025-01-02T00:00:00Z');

    for (const externalOrder of filteredOrders) {
      try {
        result.ordersProcessed++;

        // Подготавливаем данные заказа (обновленный маппинг под реальную структуру API)
        const createdAt = parseDate(externalOrder.created_at);
        const orderDate = createdAt; // используем created_at как дату заказа
        const updatedAt = new Date(); // текущее время как updated_at
        
        // Логика для paidAt: если null и дата заказа до 2 января 2025, то ставим createdAt
        let paidAt: Date | null = null;
        if (externalOrder.paid_at) {
          paidAt = parseDate(externalOrder.paid_at);
        } else if (orderDate < cutoffDate) {
          paidAt = createdAt;
        }

        const orderData = {
          customername: externalOrder.user?.full_name || null,
          customeremail: null, // нет в API
          customerphone: null, // нет в API
          status: parseInt(externalOrder.status) || 0, // конвертируем в число
          total_amount: parseDecimal(externalOrder.total_amount),
          currency: 'RUB', // по умолчанию
          orderdate: orderDate,
          created_at: createdAt, // обновляем createdAt для исправления неправильных дат
          updated_at: updatedAt,
          bankcard: externalOrder.bank_card || null,
          bonus: parseDecimal(externalOrder.bonus),
          customercity: externalOrder.user?.city || null,
          deliverycost: parseDecimal(externalOrder.delivery_cost),
          paid_at: paidAt,
          shipped_at: externalOrder.shipped_at ? parseDate(externalOrder.shipped_at) : null,
          customeraddress: null, // нет в API
        };

        // Проверяем, существует ли заказ (конвертируем number в string)
        const existingOrder = await (prisma as any).orders.findUnique({
          where: { externalid: externalOrder.id.toString() },
          include: { order_items: true },
        });

        let order;
        if (existingOrder) {
          // Обновляем существующий заказ
          order = await (prisma as any).orders.update({
            where: { externalid: externalOrder.id.toString() },
            data: orderData,
          });
          result.ordersUpdated++;
          console.log(`Updated order with externalid: ${externalOrder.id}`);
        } else {
          // Создаем новый заказ
          // Находим пользователя по tg_id или создаем нового
          let user = await (prisma as any).users.findFirst({
            where: {
              OR: [
                { tg_id: BigInt(externalOrder.user?.id || 0) },
                { email: 'default@example.com' }
              ]
            }
          });

          if (!user) {
            // Создаем пользователя по умолчанию если не найден
            user = await (prisma as any).users.findFirst({
              where: { email: 'default@example.com' }
            });
          }

          order = await (prisma as any).orders.create({
            data: {
              externalid: externalOrder.id.toString(),
              user_id: user?.id || BigInt(1), // используем id пользователя или 1 по умолчанию
              ...orderData,
            },
          });
          result.ordersCreated++;
          console.log(`Created new order with externalid: ${externalOrder.id}`);
        }

        // Обрабатываем товары в заказе
        if (externalOrder.order_items && externalOrder.order_items.length > 0) {
          // Удаляем старые товары, если это обновление
          if (existingOrder) {
            await (prisma as any).order_items.deleteMany({
              where: { order_id: order.id },
            });
          }

          // Создаем новые товары
          for (const item of externalOrder.order_items) {
            const itemPrice = parseDecimal(item.price);
            const itemQuantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity;
            
            // Пытаемся найти товар по названию для получения productId
            let productId: string | null = null;
            try {
              const matchedProduct = await (prisma as any).products.findFirst({
                where: {
                  name: {
                    contains: item.name,
                    mode: 'insensitive'
                  },
                  deleted_at: null
                }
              });
              
              if (matchedProduct) {
                productId = matchedProduct.id.toString();
              }
            } catch (productError) {
              console.warn(`Warning: Could not find product for "${item.name}":`, productError);
            }
            
            await (prisma as any).order_items.create({
              data: {
                order_id: order.id,
                product_id: productId ? BigInt(productId) : BigInt(1), // конвертируем в BigInt
                quantity: itemQuantity,
                price: itemPrice,
                created_at: new Date(),
                updated_at: new Date(),
              },
            });
            result.itemsProcessed++;
          }
        }

      } catch (orderError) {
        const errorMessage = `Error processing order ${externalOrder.id}: ${orderError instanceof Error ? orderError.message : 'Unknown error'}`;
        console.error(errorMessage);
        result.errors.push(errorMessage);
      }
    }

  } catch (error) {
    const errorMessage = `Error syncing orders: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMessage);
    result.errors.push(errorMessage);
  }

  result.duration = Date.now() - startTime;
  return result;
}

// POST - запуск синхронизации вручную
export async function POST(request: NextRequest) {
  try {
    // Временно отключаем авторизацию для тестирования
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Получаем параметры синхронизации
    const body = await request.json().catch(() => ({}));
    const { syncType, days, hours } = body;

    console.log(`Starting ${syncType || 'manual'} orders sync...`);
    
    // Определяем временной диапазон для синхронизации
    let dateFilter: Date | undefined;
    
    if (syncType === 'login' && days) {
      // Синхронизация при входе - последние N дней
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - days);
      console.log(`Синхронизация за последние ${days} дней (с ${dateFilter.toISOString()})`);
    } else if (syncType === 'hourly' && hours) {
      // Почасовая синхронизация - последние N часов
      dateFilter = new Date();
      dateFilter.setHours(dateFilter.getHours() - hours);
      console.log(`Синхронизация за последние ${hours} часов (с ${dateFilter.toISOString()})`);
    } else {
      console.log('Полная синхронизация всех заказов');
    }
    
    const result = await syncOrdersFromAPI(dateFilter);
    
    console.log('Sync completed:', result);
    return NextResponse.json({
      ...result,
      syncType: syncType || 'manual',
      dateFilter: dateFilter?.toISOString()
    });
  } catch (error) {
    console.error('Error in manual sync:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// GET - получение статуса последней синхронизации
export async function GET(request: NextRequest) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // 
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Получаем статистику последней синхронизации
    const totalOrders = await (prisma as any).orders.count();
    const lastOrder = await (prisma as any).orders.findFirst({
      orderBy: { updated_at: 'desc' },
      select: { updated_at: true },
    });

    const stats = {
      totalOrders,
      lastSyncAt: lastOrder?.updated_at || null,
      isReady: true,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 