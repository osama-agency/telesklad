import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    const { orderIds } = await request.json();
    
    console.log('🔍 Bulk delete request received:', { orderIds, types: orderIds?.map((id: any) => typeof id) });

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Необходимо указать ID заказов для удаления' },
        { status: 400 }
      );
    }

    // Конвертируем все ID в числа
    const validIds: number[] = [];
    for (const id of orderIds) {
      let numId: number;
      if (typeof id === 'string') {
        numId = parseInt(id, 10);
      } else if (typeof id === 'number') {
        numId = id;
      } else {
        console.log('❌ Invalid ID type:', typeof id, id);
        return NextResponse.json(
          { error: `Некорректный тип ID: ${typeof id}` },
          { status: 400 }
        );
      }
      
      if (isNaN(numId) || numId <= 0) {
        console.log('❌ Invalid ID value:', id, '→', numId);
        return NextResponse.json(
          { error: `Некорректное значение ID: ${id}` },
          { status: 400 }
        );
      }
      
      validIds.push(numId);
    }
    
    console.log('✅ Valid IDs:', validIds);

    // Проверяем существование заказов перед удалением
    const existingOrders = await prisma.orders.findMany({
      where: {
        id: {
          in: validIds.map(id => BigInt(id))
        }
      },
      select: {
        id: true,
        externalid: true,
        status: true
      }
    });

    if (existingOrders.length === 0) {
      return NextResponse.json(
        { error: 'Заказы не найдены' },
        { status: 404 }
      );
    }

    // Удаляем связанные записи и сами заказы в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Удаляем связанные order_items
      await tx.order_items.deleteMany({
        where: {
          order_id: {
            in: validIds.map(id => BigInt(id))
          }
        }
      });

      // Удаляем заказы
      const deletedOrders = await tx.orders.deleteMany({
        where: {
          id: {
            in: validIds.map(id => BigInt(id))
          }
        }
      });

      return deletedOrders;
    });

    console.log(`✅ Bulk deleted ${result.count} orders:`, validIds);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      deletedIds: validIds,
      foundCount: existingOrders.length,
      message: `Успешно удалено ${result.count} заказов`
    });

  } catch (error) {
    console.error('❌ Bulk delete orders error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении заказов' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 