import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ReportService } from '@/lib/services/ReportService';

const prisma = new PrismaClient();

// PUT - добавление трек-номера к заказу
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { tracking_number } = await request.json();
    const { id } = await params;
    const orderId = parseInt(id);

    if (!tracking_number || tracking_number.trim() === '') {
      return NextResponse.json({ error: 'Трек-номер не может быть пустым' }, { status: 400 });
    }

    // Получаем заказ с данными пользователя и товарами
    const order = await prisma.orders.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        users: true,
        order_items: {
          include: { 
            products: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        bank_cards: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    const previousStatus = order.status;

    // Обновляем заказ с трек-номером и статусом "shipped"
    const updatedOrder = await prisma.orders.update({
      where: { id: BigInt(orderId) },
      data: { 
        tracking_number: tracking_number.trim(),
        status: 3, // shipped
        shipped_at: new Date(),
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

    // 🔥 ОТПРАВЛЯЕМ УВЕДОМЛЕНИЯ ЧЕРЕЗ REPORTSERVICE
    let notificationResult = false;
    
    try {
      if (previousStatus !== updatedOrder.status) {
        const orderForReport = {
          ...updatedOrder,
          msg_id: updatedOrder.msg_id ? BigInt(updatedOrder.msg_id) : null
        };
        await ReportService.handleOrderStatusChange(orderForReport as any, previousStatus);
        notificationResult = true;
      }
    } catch (notificationError) {
      console.error('❌ Shipping notification error:', notificationError);
      // Не блокируем обновление из-за ошибки уведомления
    }

    console.log(`✅ Order #${orderId} tracking added: ${tracking_number.trim()}`);

    return NextResponse.json({ 
      success: true,
      order: {
        id: orderId,
        tracking_number: tracking_number.trim(),
        status: 'shipped',
        shipped_at: updatedOrder.shipped_at
      },
      notification_sent: notificationResult
    });

  } catch (error) {
    console.error('❌ Tracking update error:', error);
    return NextResponse.json(
      { error: 'Ошибка добавления трек-номера' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Вспомогательная функция для построения полного адреса
function buildFullAddress(user: any): string {
  const parts = [];
  
  if (user.address) parts.push(user.address);
  if (user.street) parts.push(user.street);
  if (user.home) parts.push(`дом ${user.home}`);
  if (user.apartment) parts.push(`кв. ${user.apartment}`);
  if (user.build) parts.push(`корп. ${user.build}`);
  
  return parts.join(', ') || 'Адрес не указан';
} 