import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { WebappTelegramBotService } from '@/lib/services/webapp-telegram-bot.service';

const prisma = new PrismaClient();

// PUT - добавление трек-номера к заказу
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { tracking_number } = await request.json();
    const orderId = parseInt(params.id);

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
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    // Обновляем заказ с трек-номером и статусом "shipped"
    const updatedOrder = await prisma.orders.update({
      where: { id: BigInt(orderId) },
      data: { 
        tracking_number: tracking_number.trim(),
        status: 3, // shipped
        shipped_at: new Date(),
        updated_at: new Date()
      }
    });

    // Подготавливаем данные для уведомления
    const orderData = {
      id: orderId,
      total_amount: Number(order.total_amount),
      items: order.order_items.map(item => ({
        product_name: item.products.name || 'Товар',
        quantity: item.quantity,
        price: Number(item.price || 0)
      })),
      bonus: order.bonus
    };

    const userData = {
      tg_id: order.users.tg_id.toString(),
      full_name: `${order.users.first_name || ''} ${order.users.last_name || ''}`.trim() || 'Клиент',
      full_address: buildFullAddress(order.users),
      phone_number: order.users.phone_number || 'Не указан',
      postal_code: order.users.postal_code || undefined
    };

    // 🔥 ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ О ДОСТАВКЕ С ТРЕК-НОМЕРОМ
    let notificationResult = false;
    
    try {
      notificationResult = await WebappTelegramBotService.sendOrderShipped(
        orderData, 
        userData, 
        tracking_number.trim()
      );
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