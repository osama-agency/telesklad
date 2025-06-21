import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NotificationSchedulerService } from '@/lib/services/notification-scheduler.service';

const prisma = new PrismaClient();

// PUT - обновление остатков товара с уведомлениями о поступлении
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { stock_quantity } = await request.json();
    const productId = parseInt(params.id);

    if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Неверное количество товара' 
      }, { status: 400 });
    }

    // Получаем текущий товар
    const currentProduct = await prisma.products.findUnique({
      where: { id: BigInt(productId) }
    });

    if (!currentProduct) {
      return NextResponse.json({ 
        success: false, 
        error: 'Товар не найден' 
      }, { status: 404 });
    }

    const oldQuantity = currentProduct.stock_quantity;
    
    // Обновляем остатки товара
    const updatedProduct = await prisma.products.update({
      where: { id: BigInt(productId) },
      data: { 
        stock_quantity: stock_quantity,
        updated_at: new Date()
      }
    });

    // 📦 ПРОВЕРЯЕМ ПОСТУПЛЕНИЕ ТОВАРА (0 → >0)
    const wasOutOfStock = oldQuantity === 0;
    const isNowInStock = stock_quantity > 0;
    
    if (wasOutOfStock && isNowInStock) {
      try {
        // Планируем уведомления о поступлении для всех подписчиков
        await NotificationSchedulerService.scheduleRestockNotification(productId);
        console.log(`📦 Restock notifications scheduled for product #${productId} (${oldQuantity} → ${stock_quantity})`);
      } catch (notificationError) {
        console.error('❌ Error scheduling restock notifications:', notificationError);
        // Не блокируем обновление остатков из-за ошибки уведомлений
      }
    }

    console.log(`📊 Product #${productId} stock updated: ${oldQuantity} → ${stock_quantity}`);

    return NextResponse.json({
      success: true,
      product: {
        id: productId,
        stock_quantity: stock_quantity,
        updated_at: updatedProduct.updated_at,
        restock_notification_sent: wasOutOfStock && isNowInStock
      },
      message: 'Остатки товара обновлены'
    });

  } catch (error) {
    console.error('❌ Product stock update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка обновления остатков товара' 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - получение информации об остатках товара
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = parseInt(params.id);

    const product = await prisma.products.findUnique({
      where: { id: BigInt(productId) },
      select: {
        id: true,
        name: true,
        stock_quantity: true,
        updated_at: true
      }
    });

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Товар не найден' 
      }, { status: 404 });
    }

    // Получаем количество подписчиков
    const subscribersCount = await prisma.product_subscriptions.count({
      where: { product_id: BigInt(productId) }
    });

    return NextResponse.json({
      success: true,
      product: {
        id: Number(product.id),
        name: product.name,
        stock_quantity: product.stock_quantity,
        updated_at: product.updated_at,
        subscribers_count: subscribersCount
      }
    });

  } catch (error) {
    console.error('❌ Product stock info error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка получения информации о товаре' 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 