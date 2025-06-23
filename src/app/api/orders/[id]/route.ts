import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { Prisma } from '@prisma/client';
import { serializeBigInts } from '@/lib/utils';

// GET - получение одного заказа по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;
    const orderId = parseInt(id);

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await (prisma as any).orders.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image_url: true,
                brand: true,
              }
            }
          }
        },
        bank_cards: {
          select: {
            id: true,
            name: true,
            number: true,
          }
        },
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            middle_name: true,
            email: true,
            phone_number: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Обрабатываем информацию о пользователе для правильного отображения Имя + Фамилия
    if (order.users) {
      const user = order.users;
      order.user = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.middle_name, // В старой Rails системе middle_name содержит фамилию
        middle_name: user.last_name, // А last_name содержит отчество
        phone_number: user.phone_number,
        full_name: [user.first_name, user.middle_name].filter(Boolean).join(' ') || 'Не указано', // Имя + Фамилия
      };
      // Удаляем старый объект users, чтобы использовать новый user
      delete order.users;
    }

    console.log('📋 Order API: Returning order data:', {
      id: order.id,
      customername: order.customername,
      customerphone: order.customerphone,
      customeremail: order.customeremail,
      customercity: order.customercity,
      customeraddress: order.customeraddress,
      tracking_number: order.tracking_number,
      total_amount: order.total_amount,
      bonus: order.bonus,
      deliverycost: order.deliverycost,
      user: order.user
    });

    return NextResponse.json(serializeBigInts(order));

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - обновление заказа
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;
    const orderId = parseInt(id);

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Проверяем существование заказа
    const existingOrder = await (prisma as any).orders.findUnique({
      where: { id: BigInt(orderId) }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      updated_at: new Date(),
    };

    // Обновляем только переданные поля
    if (body.status !== undefined) updateData.status = body.status;
    if (body.total_amount !== undefined) updateData.total_amount = body.total_amount;
    if (body.customername !== undefined) updateData.customername = body.customername;
    if (body.customeremail !== undefined) updateData.customeremail = body.customeremail;
    if (body.customerphone !== undefined) updateData.customerphone = body.customerphone;
    if (body.customercity !== undefined) updateData.customercity = body.customercity;
    if (body.customeraddress !== undefined) updateData.customeraddress = body.customeraddress;
    if (body.tracking_number !== undefined) updateData.tracking_number = body.tracking_number;
    if (body.paid_at !== undefined) updateData.paid_at = body.paid_at ? new Date(body.paid_at) : null;
    if (body.shipped_at !== undefined) updateData.shipped_at = body.shipped_at ? new Date(body.shipped_at) : null;
    if (body.bonus !== undefined) updateData.bonus = body.bonus;
    if (body.deliverycost !== undefined) updateData.deliverycost = body.deliverycost;

    const updatedOrder = await (prisma as any).orders.update({
      where: { id: BigInt(orderId) },
      data: updateData,
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image_url: true,
                brand: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(serializeBigInts(updatedOrder));

  } catch (error) {
    console.error('Error updating order:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error message:', error.message);
    }
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - удаление заказа
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;
    const orderId = parseInt(id);

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    console.log(`🗑️ Deleting order #${orderId}`);

    // Проверяем существование заказа
    const existingOrder = await (prisma as any).orders.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        order_items: true
      }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Проверяем статус заказа - нельзя удалять отправленные заказы
    if (existingOrder.status === 4) { // статус "Отправлен"
      return NextResponse.json({ 
        error: 'Cannot delete shipped order' 
      }, { status: 400 });
    }

    // Начинаем транзакцию для атомарного удаления
    await prisma.$transaction(async (tx) => {
      // Сначала удаляем элементы заказа
      await (tx as any).order_items.deleteMany({
        where: { order_id: BigInt(orderId) }
      });

      // Затем удаляем сам заказ
      await (tx as any).orders.delete({
        where: { id: BigInt(orderId) }
      });
    });

    console.log(`✅ Order #${orderId} deleted successfully`);

    return NextResponse.json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Error deleting order:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error message:', error.message);
      
      if (error.code === 'P2003') {
        return NextResponse.json({ 
          error: 'Cannot delete order due to foreign key constraints' 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete order', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 