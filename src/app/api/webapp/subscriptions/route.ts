import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Временный пользователь для демонстрации
// В реальном проекте ID будет из сессии/токена
const DEMO_USER_ID = 1;

// GET /api/webapp/subscriptions - получить подписки пользователя на товары
export async function GET(request: NextRequest) {
  try {
    // Получаем подписки пользователя на товары (как в Rails: user.product_subscriptions.includes(:product))
    const subscriptions = await prisma.product_subscriptions.findMany({
      where: {
        user_id: DEMO_USER_ID
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            old_price: true,
            stock_quantity: true,
            deleted_at: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Преобразуем подписки в нужный формат
    const transformedSubscriptions = subscriptions.map(subscription => ({
      id: Number(subscription.id),
      product: {
        id: Number(subscription.products.id),
        name: subscription.products.name,
        price: Number(subscription.products.price || 0),
        old_price: subscription.products.old_price ? Number(subscription.products.old_price) : undefined,
        stock_quantity: Number(subscription.products.stock_quantity),
        is_available: subscription.products.stock_quantity > 0,
        is_deleted: !!subscription.products.deleted_at
      },
      subscribed_at: subscription.created_at,
      // Статус подписки
      status: subscription.products.deleted_at 
        ? 'removed'  // товар удален
        : subscription.products.stock_quantity > 0 
          ? 'available'  // товар появился в наличии
          : 'waiting'    // ожидаем поступления
    }));

    // Группируем по статусам для статистики
    const stats = {
      total_subscriptions: transformedSubscriptions.length,
      available_products: transformedSubscriptions.filter(s => s.status === 'available').length,
      waiting_products: transformedSubscriptions.filter(s => s.status === 'waiting').length,
      removed_products: transformedSubscriptions.filter(s => s.status === 'removed').length
    };

    return NextResponse.json({
      success: true,
      subscriptions: transformedSubscriptions,
      stats: stats,
      count: transformedSubscriptions.length
    });

  } catch (error) {
    console.error('Subscriptions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки подписок' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/webapp/subscriptions - подписаться на товар
export async function POST(request: NextRequest) {
  try {
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Не указан ID товара' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли товар
    const product = await prisma.products.findFirst({
      where: {
        id: parseInt(product_id),
        deleted_at: null
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Проверяем, нет ли уже подписки на этот товар
    const existingSubscription = await prisma.product_subscriptions.findFirst({
      where: {
        user_id: DEMO_USER_ID,
        product_id: parseInt(product_id)
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'Подписка на этот товар уже существует' },
        { status: 400 }
      );
    }

    // Создаем подписку
    const subscription = await prisma.product_subscriptions.create({
      data: {
        user_id: DEMO_USER_ID,
        product_id: parseInt(product_id),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Подписка создана',
      subscription_id: Number(subscription.id),
      product_id: parseInt(product_id)
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания подписки' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/webapp/subscriptions - отписаться от товара
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Не указан ID товара' },
        { status: 400 }
      );
    }

    // Удаляем подписку
    const deleted = await prisma.product_subscriptions.deleteMany({
      where: {
        user_id: DEMO_USER_ID,
        product_id: parseInt(product_id)
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Подписка не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Подписка отменена',
      product_id: parseInt(product_id)
    });

  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка отмены подписки' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 