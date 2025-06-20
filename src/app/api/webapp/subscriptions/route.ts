import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { S3Service } from '@/lib/services/s3';

const prisma = new PrismaClient();

// Тот же фиксированный тестовый пользователь как в profile
const TEST_USER_ID = 9999;

// GET /api/webapp/subscriptions - получить подписки пользователя
export async function GET(request: NextRequest) {
  try {
    console.log(`Getting subscriptions for user ${TEST_USER_ID}`);

    const subscriptions = await prisma.product_subscriptions.findMany({
      where: { 
        user_id: TEST_USER_ID 
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            old_price: true,
            stock_quantity: true
          }
        }
      }
    });

    // Получаем изображения для всех продуктов в подписках
    const productIds = subscriptions
      .map(sub => Number(sub.product_id))
      .filter(id => id !== null);

    let imageMapping: { [key: number]: string } = {};

    if (productIds.length > 0) {
      const attachments = await prisma.active_storage_attachments.findMany({
        where: {
          record_type: 'Product',
          record_id: {
            in: productIds
          },
          name: 'image'
        },
        include: {
          active_storage_blobs: true
        }
      });

      // Создаем маппинг product_id -> blob_key
      attachments.forEach(attachment => {
        if (attachment.active_storage_blobs?.key) {
          imageMapping[Number(attachment.record_id)] = attachment.active_storage_blobs.key;
        }
      });
    }

    // Преобразуем результат для фронтенда
    const result = subscriptions.map(sub => {
      const blobKey = imageMapping[Number(sub.product_id)];
      
      return {
        id: Number(sub.id),
        product_id: Number(sub.product_id),
        user_id: Number(sub.user_id),
        created_at: sub.created_at,
        updated_at: sub.updated_at,
        product: sub.products ? {
          id: Number(sub.products.id),
          name: sub.products.name,
          price: sub.products.price,
          old_price: sub.products.old_price ? Number(sub.products.old_price) : null,
          quantity: sub.products.stock_quantity,
          available: sub.products.stock_quantity > 0,
          image_url: blobKey ? S3Service.getImageUrl(blobKey) : undefined
        } : null
      };
    });

    console.log(`Found ${result.length} subscriptions`);

    return NextResponse.json({
      success: true,
      subscriptions: result
    });

  } catch (error) {
    console.error('Subscriptions GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка загрузки подписок',
        subscriptions: []
      },
      { status: 500 }
    );
  }
}

// POST /api/webapp/subscriptions - создать подписку
export async function POST(request: NextRequest) {
  try {
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID обязателен' },
        { status: 400 }
      );
    }

    console.log(`Adding subscription for user ${TEST_USER_ID}, product ${product_id}`);

    // Проверяем, есть ли уже такая подписка
    const existingSubscription = await prisma.product_subscriptions.findFirst({
      where: {
        user_id: TEST_USER_ID,
        product_id: parseInt(product_id)
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'Подписка уже существует' },
        { status: 409 }
      );
    }

    // Создаем новую подписку
    const subscription = await prisma.product_subscriptions.create({
      data: {
        user_id: TEST_USER_ID,
        product_id: parseInt(product_id),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log(`Successfully created subscription ${subscription.id}`);

    return NextResponse.json({
      success: true,
      message: 'Подписка создана',
      subscription: {
        id: Number(subscription.id),
        user_id: Number(subscription.user_id),
        product_id: Number(subscription.product_id),
        created_at: subscription.created_at,
        updated_at: subscription.updated_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Subscription create error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания подписки' },
      { status: 500 }
    );
  }
}

// DELETE /api/webapp/subscriptions - удалить подписку
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID обязателен' },
        { status: 400 }
      );
    }

    console.log(`Removing subscription for user ${TEST_USER_ID}, product ${product_id}`);

    // Ищем подписку
    const subscription = await prisma.product_subscriptions.findFirst({
      where: {
        user_id: TEST_USER_ID,
        product_id: parseInt(product_id)
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Подписка не найдена' },
        { status: 404 }
      );
    }

    // Удаляем подписку
    await prisma.product_subscriptions.delete({
      where: {
        id: subscription.id
      }
    });

    console.log(`Successfully removed subscription for product ${product_id}`);

    return NextResponse.json({
      success: true,
      message: 'Подписка удалена'
    });

  } catch (error) {
    console.error('Subscription delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления подписки' },
      { status: 500 }
    );
  }
} 