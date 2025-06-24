import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import LoyaltyService from '@/lib/services/loyaltyService';
import { S3Service } from '@/lib/services/s3';
import { TelegramService } from '@/lib/services/TelegramService';
import { ReportService } from '@/lib/services/ReportService';
import { NotificationSchedulerService } from '@/lib/services/notification-scheduler.service';
import { getServerSession } from "next-auth";



// Статусы заказов как в Rails проекте
const ORDER_STATUSES = {
  0: 'unpaid',     // не оплачен
  1: 'paid',       // оплачен
  2: 'processing', // обрабатывается
  3: 'shipped',    // отправлен
  4: 'delivered',  // доставлен
  5: 'cancelled'   // отменен
};

const STATUS_LABELS = {
  'unpaid': 'Ожидает оплаты',
  'paid': 'Проверка оплаты',
  'processing': 'Обрабатывается',
  'shipped': 'Отправлен', 
  'delivered': 'Доставлен',
  'cancelled': 'Отменен'
};

// Функция для извлечения данных пользователя из Telegram initData
function extractTelegramUser(request: NextRequest) {
  const initData = request.headers.get('X-Telegram-Init-Data');
  
  if (initData) {
    try {
      const params = new URLSearchParams(initData);
      const user = params.get('user');
      if (user) {
        return JSON.parse(user);
      }
    } catch (error) {
      console.error('Error parsing Telegram initData:', error);
    }
  }
  
  return null;
}

// GET /api/webapp/orders - получить заказы пользователя
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    let userId = url.searchParams.get('user_id');
    let tgId = url.searchParams.get('tg_id');
    
    // Попытка получить пользователя из Telegram initData
    if (!userId && !tgId) {
      const telegramUser = extractTelegramUser(request);
      if (telegramUser?.id) {
        tgId = telegramUser.id.toString();
      }
    }
    
    // Если все еще нет идентификатора пользователя, возвращаем ошибку
    if (!userId && !tgId) {
      return NextResponse.json({ 
        error: 'user_id or tg_id parameter is required' 
      }, { status: 400 });
    }

    // Ищем пользователя по user_id или tg_id
    let user;
    if (userId) {
      user = await prisma.users.findUnique({
        where: { id: BigInt(userId) }
      });
    } else if (tgId) {
      user = await prisma.users.findUnique({
        where: { tg_id: BigInt(tgId) }
      });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Получаем заказы пользователя с детализацией
    const orders = await prisma.orders.findMany({
      where: {
        user_id: user.id
      },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                image_url: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Получаем изображения для всех товаров одним запросом
    const allProductIds = orders.flatMap(order => 
      order.order_items.map(item => Number(item.products?.id)).filter(Boolean)
    );
    const uniqueProductIds = [...new Set(allProductIds)];
    
    const attachments = await prisma.active_storage_attachments.findMany({
      where: {
        record_type: 'Product',
        record_id: { in: uniqueProductIds },
        name: 'image'
      },
      include: {
        active_storage_blobs: true
      }
    });

    // Создаем карту product_id -> blob_key
    const imageMap = new Map<number, string>();
    attachments.forEach(attachment => {
      imageMap.set(Number(attachment.record_id), attachment.active_storage_blobs.key);
    });

    // Преобразуем для фронтенда
    const formattedOrders = orders.map(order => {
      const orderItems = order.order_items.map(item => {
        const productId = Number(item.products?.id);
        const blobKey = imageMap.get(productId);
        
        // Приоритет image_url из базы, затем из S3
        let imageUrl = item.products?.image_url;
        if (!imageUrl && blobKey) {
          imageUrl = S3Service.getImageUrl(blobKey);
        }
        
        const price = Number(item.price || 0);
        const quantity = item.quantity;
        const total = price * quantity;
        
        return {
          id: Number(item.id),
          product_id: Number(item.product_id),
          product_name: item.products?.name,
          image_url: imageUrl,
          quantity: quantity,
          price: price,
          total: total
        };
      });

      // Рассчитываем общее количество товаров и сумму
      const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const calculatedTotal = orderItems.reduce((sum, item) => sum + item.total, 0);
      
      // Преобразуем числовой статус в строковый
      const statusKey = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || 'unpaid';
      const statusLabel = STATUS_LABELS[statusKey as keyof typeof STATUS_LABELS] || 'Неизвестно';

      return {
        id: Number(order.id),
        total_amount: Number(order.total_amount) || calculatedTotal,
        status: statusKey,
        status_label: statusLabel,
        created_at: order.created_at,
        updated_at: order.updated_at,
        tracking_number: order.tracking_number,
        paid_at: order.paid_at,
        shipped_at: order.shipped_at,
        bonus: Number(order.bonus || 0),
        has_delivery: !!order.tracking_number,
        total_items: totalItems,
        items_count: orderItems.length,
        items: orderItems
      };
    });

    // Рассчитываем статистику
    const stats = {
      total_orders: formattedOrders.length,
      unpaid_orders: formattedOrders.filter(o => o.status === 'unpaid').length,
      paid_orders: formattedOrders.filter(o => o.status === 'paid').length,
      shipped_orders: formattedOrders.filter(o => o.status === 'shipped').length,
      delivered_orders: formattedOrders.filter(o => o.status === 'delivered').length,
      cancelled_orders: formattedOrders.filter(o => o.status === 'cancelled').length,
      total_amount: formattedOrders.reduce((sum, order) => sum + order.total_amount, 0),
      total_bonus_earned: formattedOrders.reduce((sum, order) => sum + order.bonus, 0)
    };

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      stats: stats,
      count: formattedOrders.length
    });

  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        orders: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// POST /api/webapp/orders - создать новый заказ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { user_id, tg_id, cart_items, delivery_address, total_amount } = body;

    // Попытка получить пользователя из Telegram initData если не передан в теле
    if (!user_id && !tg_id) {
      const telegramUser = extractTelegramUser(request);
      if (telegramUser?.id) {
        tg_id = telegramUser.id.toString();
      }
    }

    if ((!user_id && !tg_id) || !cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return NextResponse.json({ 
        error: '(user_id or tg_id) and cart_items are required' 
      }, { status: 400 });
    }

    // Ищем пользователя по user_id или tg_id
    let user;
    if (user_id) {
      user = await prisma.users.findUnique({
        where: { id: BigInt(user_id) }
      });
    } else if (tg_id) {
      user = await prisma.users.findUnique({
        where: { tg_id: BigInt(tg_id) }
      });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Создаем заказ в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // 🏦 Выбираем активную банковскую карту по очереди
      const activeBankCard = await tx.bank_cards.findFirst({
        where: { active: true },
        orderBy: [
          { updated_at: 'asc' }, // Выбираем карту, которая дольше всего не использовалась
          { id: 'asc' }
        ]
      });

      if (!activeBankCard) {
        throw new Error('No active bank cards found. Please add an active bank card.');
      }

      // 💰 Рассчитываем общую сумму заказа из товаров в базе данных
      let calculatedTotal = 0;
      const enrichedCartItems = [];
      
      for (const item of cart_items) {
        // Получаем актуальную цену товара из базы данных
        const product = await tx.products.findUnique({
          where: { id: BigInt(item.product_id) },
          select: { price: true, name: true }
        });
        
        if (product && item.quantity) {
          const itemPrice = item.price || product.price || 0;
          calculatedTotal += itemPrice * item.quantity;
          enrichedCartItems.push({
            ...item,
            price: itemPrice,
            product_name: product.name
          });
        }
      }

      // Стоимость доставки (500₽) - будет отдельным полем
      const deliveryCost = 500;
      // total_amount включает только товары, доставка отдельно в deliverycost
      const finalTotal = calculatedTotal;

      // Создаем полный адрес пользователя
      const fullAddress = buildFullAddress({
        postal_code: user.postal_code,
        address: user.address,
        street: user.street,
        home: user.home,
        apartment: user.apartment,
        build: user.build
      });

      // Формируем полное имя пользователя
      const fullName = [user.first_name, user.middle_name, user.last_name]
        .filter(Boolean)
        .join(' ') || 'Не указано';

      // Создаем заказ с привязкой к банковской карте
      const order = await tx.orders.create({
        data: {
          user_id: user.id,
          total_amount: finalTotal,
          status: 0, // Новый заказ
          bank_card_id: activeBankCard.id, // Привязываем выбранную карту
          customeraddress: fullAddress, // Сохраняем полный адрес
          customername: fullName, // Полное имя клиента
          customerphone: user.phone_number || null, // Телефон клиента
          customeremail: user.email || null, // Email клиента
          customercity: user.address || null, // Город из адреса
          deliverycost: deliveryCost, // Стоимость доставки 500₽
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Обновляем время использования карты (для ротации)
      await tx.bank_cards.update({
        where: { id: activeBankCard.id },
        data: { updated_at: new Date() }
      });

      // Создаем позиции заказа с правильными ценами
      const orderItems = await Promise.all(
        enrichedCartItems.map(async (item: any) => {
          return await tx.order_items.create({
            data: {
              order_id: order.id,
              product_id: BigInt(item.product_id),
              quantity: item.quantity,
              price: item.price, // Используем обогащенную цену
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        })
      );

      return { order, orderItems };
    });

    // 🔥 ВАЖНО: Отправляем уведомления после создания заказа
    try {
      // Получаем полный заказ с пользователем и товарами для уведомлений
      const fullOrder = await prisma.orders.findUnique({
        where: { id: result.order.id },
        include: {
          users: true,
          order_items: {
            include: {
              products: true
            }
          },
          bank_cards: {
            select: {
              id: true,
              name: true,
              fio: true,
              number: true
            }
          }
        }
      });

      if (fullOrder) {
        console.log(`📧 Sending notifications for new order ${fullOrder.id}`);
        await ReportService.handleOrderStatusChange(fullOrder as any, -1); // -1 = предыдущий статус (нет заказа)
      }
    } catch (notificationError) {
      console.error('❌ Error sending order notifications:', notificationError);
      // Не ломаем создание заказа если уведомления не отправились
    }

    return NextResponse.json({ 
      success: true, 
      order_id: Number(result.order.id),
      order: {
        id: Number(result.order.id),
        total_amount: Number(result.order.total_amount),
        status: result.order.status,
        created_at: result.order.created_at
      }
    });

  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для построения полного адреса
function buildFullAddress(data: any): string {
  const parts = [];
  
  // Добавляем почтовый индекс в начало
  if (data.postal_code) parts.push(data.postal_code.toString());
  
  // Добавляем город/адрес
  if (data.address) parts.push(data.address);
  if (data.city) parts.push(data.city);
  if (data.street) parts.push(data.street);
  if (data.home) parts.push(`дом ${data.home}`);
  if (data.build) parts.push(`корп. ${data.build}`);
  if (data.apartment) parts.push(`кв. ${data.apartment}`);
  
  return parts.join(', ') || 'Адрес не указан';
} 