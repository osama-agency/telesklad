import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/ReportService';
import { prisma } from '@/libs/prismaDb';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Telegram notifications endpoint called');

    // ИСПРАВЛЕНО: Находим заказ со статусом 0 (unpaid) для тестирования "Я оплатил"
    const testOrder = await prisma.orders.findFirst({
      where: {
        status: 0 // Только неоплаченные заказы
      },
      include: {
        users: true,
        order_items: {
          include: {
            products: true
          }
        },
        bank_cards: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!testOrder) {
      return NextResponse.json({
        success: false,
        message: 'No unpaid orders found for testing. Create a new order first.'
      }, { status: 404 });
    }

    console.log(`🧪 Testing with order: ${testOrder.id}`);
    console.log('🧪 Simulating "I paid" notification...');

    // Преобразуем данные к формату, ожидаемому ReportService
    const formattedOrder = {
      ...testOrder,
      total_amount: Number(testOrder.total_amount), // Decimal -> number
      deliverycost: testOrder.deliverycost ? Number(testOrder.deliverycost) : null,
      order_items: testOrder.order_items.map(item => ({
        ...item,
        price: Number(item.price), // Decimal -> number
        products: {
          ...item.products,
          price: Number(item.products.price) // Decimal -> number
        }
      }))
    };

    // ИСПРАВЛЕНО: Реально обновляем статус заказа в базе данных
    const previousStatus = testOrder.status;
    
    // Обновляем статус на "paid" (1) в базе данных
    const updatedOrder = await prisma.orders.update({
      where: { id: testOrder.id },
      data: { 
        status: 1, // paid
        updated_at: new Date()
      },
      include: {
        users: true,
        order_items: {
          include: {
            products: true
          }
        },
        bank_cards: true
      }
    });

    // Преобразуем обновленный заказ
    const formattedUpdatedOrder = {
      ...updatedOrder,
      total_amount: Number(updatedOrder.total_amount),
      deliverycost: updatedOrder.deliverycost ? Number(updatedOrder.deliverycost) : null,
      order_items: updatedOrder.order_items.map(item => ({
        ...item,
        price: Number(item.price),
        products: {
          ...item.products,
          price: Number(item.products.price)
        }
      }))
    };

    console.log('🧪 Calling ReportService.handleOrderStatusChange...');
    await ReportService.handleOrderStatusChange(formattedUpdatedOrder as any, previousStatus);

    console.log('✅ Test notification sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      order_id: updatedOrder.id.toString(), // Конвертируем BigInt в строку
      user_id: updatedOrder.users.tg_id.toString(),
      status_change: `${previousStatus} -> ${updatedOrder.status} (paid)`
    });

  } catch (error) {
    console.error('❌ Test notification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send test notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Telegram notifications test endpoint',
    note: 'Use POST to test notifications',
    endpoints: {
      test: 'POST /api/test-telegram-notifications'
    }
  });
} 