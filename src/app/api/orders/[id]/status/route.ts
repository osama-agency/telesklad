import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { ReportService } from '@/lib/services/report.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Получаем текущий заказ
    const currentOrder = await prisma.orders.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        order_items: {
          include: {
            products: true
          }
        },
        users: true,
        bank_cards: true
      }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = currentOrder.status;

    // Маппинг статусов из строк в числа
    const statusMap: { [key: string]: number } = {
      'unpaid': 0,
      'paid': 1,
      'processing': 2,
      'shipped': 3,
      'delivered': 4,
      'cancelled': 5,
      'refunded': 6,
      'overdue': 7
    };

    const newStatusNumber = typeof status === 'string' ? statusMap[status] : status;

    if (newStatusNumber === undefined) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Обновляем статус заказа
    const updatedOrder = await prisma.orders.update({
      where: { id: BigInt(orderId) },
      data: {
        status: newStatusNumber,
        updated_at: new Date(),
        // Добавляем дополнительные поля в зависимости от статуса
        ...(newStatusNumber === 1 && { paid_at: new Date() }),
        ...(newStatusNumber === 3 && { shipped_at: new Date() }),
        ...(newStatusNumber === 4 && { delivered_at: new Date() })
      },
      include: {
        order_items: {
          include: {
            products: true
          }
        },
        users: true,
        bank_cards: true
      }
    });

    // Отправляем уведомления через ReportService если статус изменился
    if (previousStatus !== newStatusNumber) {
      console.log(`📋 Order ${orderId} status changed from ${previousStatus} to ${newStatusNumber}`);
      
      // Преобразуем msg_id в bigint если оно есть
      const orderForReport = {
        ...updatedOrder,
        msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
      };
      
      await ReportService.handleOrderStatusChange(orderForReport as any, previousStatus);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id.toString(),
        status: updatedOrder.status,
        previousStatus,
        updated_at: updatedOrder.updated_at
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}