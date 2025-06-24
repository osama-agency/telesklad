import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/ReportService';
import { prisma } from '@/libs/prismaDb';

export async function POST(request: NextRequest) {
  try {
    const { orderId, action } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    // Получаем заказ
    const order = await prisma.orders.findUnique({
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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let previousStatus = order.status;
    let newStatus = order.status;

    // Определяем новый статус в зависимости от действия
    switch (action) {
      case 'approve_payment':
        previousStatus = 1; // paid
        newStatus = 2; // processing
        
        // Обновляем статус в базе
        await prisma.orders.update({
          where: { id: BigInt(orderId) },
          data: {
            status: newStatus,
            paid_at: new Date(),
            updated_at: new Date()
          }
        });
        
        // Получаем обновленный заказ
        const updatedOrder = await prisma.orders.findUnique({
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

        if (updatedOrder) {
          const orderForReport = {
            ...updatedOrder,
            msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
          };
          
          await ReportService.handleOrderStatusChange(orderForReport as any, previousStatus);
        }
        break;
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      orderId, 
      action,
      previousStatus,
      newStatus,
      message: 'Report sent successfully'
    });

  } catch (error) {
    console.error('Test report error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 