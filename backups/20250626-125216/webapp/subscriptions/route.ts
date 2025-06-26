import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { S3Service } from '@/lib/services/s3';

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

    console.log(`Getting subscriptions for user ${user.id} (tg_id: ${user.tg_id})`);

    const subscriptions = await prisma.product_subscriptions.findMany({
      where: { 
        user_id: user.id
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            image_url: true,
            price: true,
            stock_quantity: true,
            show_in_webapp: true
          }
        }
      }
    });

    console.log(`Found ${subscriptions.length} subscriptions`);

    // Получаем изображения для всех товаров одним запросом
    const productIds = subscriptions.map(sub => Number(sub.products?.id)).filter(Boolean);
    const attachments = await prisma.active_storage_attachments.findMany({
      where: {
        record_type: 'Product',
        record_id: { in: productIds },
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

    // Transform for webapp format
    const formattedSubscriptions = subscriptions
      .filter(sub => sub.products?.show_in_webapp)
      .map(subscription => {
        const product = subscription.products;
        const productId = Number(product?.id);
        const blobKey = imageMap.get(productId);
        
        // Приоритет image_url из базы, затем из S3
        let imageUrl = product?.image_url;
        if (!imageUrl && blobKey) {
          imageUrl = S3Service.getImageUrl(blobKey);
        }
        
        return {
          id: subscription.id,
          product_id: product?.id,
          title: product?.name,
          image_url: imageUrl,
          price: product?.price,
          is_in_stock: (product?.stock_quantity || 0) > 0,
          created_at: subscription.created_at,
          updated_at: subscription.updated_at,
          product: {
            id: product?.id,
            name: product?.name,
            price: product?.price,
            old_price: null,
            quantity: product?.stock_quantity || 0,
            available: (product?.stock_quantity || 0) > 0,
            image_url: imageUrl
          }
        };
      });

    // Преобразуем BigInt в строки для JSON сериализации
    const serializedSubscriptions = formattedSubscriptions.map(sub => ({
      ...sub,
      id: Number(sub.id), // Преобразуем в Number вместо строки
      product_id: Number(sub.product_id),
      price: Number(sub.price),
      created_at: sub.created_at?.toISOString(),
      updated_at: sub.updated_at?.toISOString(),
      product: sub.product ? {
        ...sub.product,
        id: Number(sub.product.id),
        price: Number(sub.product.price)
      } : null
    }));

    return NextResponse.json({
      subscriptions: serializedSubscriptions,
      total: serializedSubscriptions.length
    });

  } catch (error) {
    console.error('Subscriptions GET error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch subscriptions',
        subscriptions: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST /api/webapp/subscriptions - Headers:', {
      'content-type': request.headers.get('content-type'),
      'x-telegram-init-data': request.headers.get('X-Telegram-Init-Data') ? 'present' : 'missing'
    });

    const body = await request.json();
    console.log('📥 POST /api/webapp/subscriptions - Body:', body);
    
    let { product_id, user_id, tg_id } = body;

    // Попытка получить пользователя из Telegram initData если не передан в теле
    if (!user_id && !tg_id) {
      const telegramUser = extractTelegramUser(request);
      console.log('📥 Extracted Telegram user from headers:', telegramUser);
      if (telegramUser?.id) {
        tg_id = telegramUser.id.toString();
      }
    }

    console.log('📥 Final auth data:', { product_id, user_id, tg_id });

    if (!product_id || (!user_id && !tg_id)) {
      console.log('❌ Missing required fields:', { 
        has_product_id: !!product_id, 
        has_user_id: !!user_id, 
        has_tg_id: !!tg_id 
      });
      return NextResponse.json({ 
        error: 'product_id and (user_id or tg_id) are required',
        received: { product_id, user_id, tg_id }
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

    // Check if subscription already exists
    const existingSubscription = await prisma.product_subscriptions.findFirst({
      where: {
        user_id: user.id,
        product_id: BigInt(product_id)
      }
    });

    if (existingSubscription) {
      console.log(`⚠️ Subscription already exists for user ${user.id}, product ${product_id}`);
      return NextResponse.json({ 
        success: true,
        message: 'Subscription already exists',
        subscription: {
          id: Number(existingSubscription.id),
          product_id: Number(existingSubscription.product_id),
          user_id: Number(existingSubscription.user_id)
        }
      }, { status: 200 }); // Возвращаем 200 вместо 409
    }

    console.log(`Adding subscription for user ${user.id} (tg_id: ${user.tg_id}), product ${product_id}`);

    const subscription = await prisma.product_subscriptions.create({
      data: {
        user_id: user.id,
        product_id: BigInt(product_id),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      subscription: {
        id: Number(subscription.id),
        product_id: Number(subscription.product_id),
        user_id: Number(subscription.user_id)
      }
    });

  } catch (error) {
    console.error('Subscriptions POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const product_id = url.searchParams.get('product_id');
    let user_id = url.searchParams.get('user_id');
    let tg_id = url.searchParams.get('tg_id');

    // Попытка получить пользователя из Telegram initData
    if (!user_id && !tg_id) {
      const telegramUser = extractTelegramUser(request);
      if (telegramUser?.id) {
        tg_id = telegramUser.id.toString();
      }
    }

    if (!product_id || (!user_id && !tg_id)) {
      return NextResponse.json({ 
        error: 'product_id and (user_id or tg_id) are required' 
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

    console.log(`Removing subscription for user ${user.id} (tg_id: ${user.tg_id}), product ${product_id}`);

    const deletedSubscription = await prisma.product_subscriptions.deleteMany({
      where: {
        user_id: user.id,
        product_id: BigInt(product_id)
      }
    });

    return NextResponse.json({ 
      success: true, 
      deleted_count: deletedSubscription.count 
    });

  } catch (error) {
    console.error('Subscriptions DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
} 