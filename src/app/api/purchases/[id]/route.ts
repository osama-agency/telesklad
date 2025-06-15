import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

// GET - получение конкретной закупки
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const purchaseId = parseInt(id);

    if (isNaN(purchaseId)) {
      return NextResponse.json({ error: 'Invalid purchase ID' }, { status: 400 });
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        id: purchaseId,
        user: {
          email: session.user.email
        }
      },
      include: {
        items: true,
        user: true,
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - обновление закупки
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { items, totalAmount, isUrgent, expenses, status } = await request.json();

    // Проверяем, принадлежит ли закупка пользователю
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        id: parseInt(id),
        user: {
          email: session.user.email
        }
      }
    });

    if (!existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Обновляем закупку в транзакции
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // Удаляем старые элементы
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: parseInt(id) }
      });

      // Обновляем основную закупку
      const purchase = await tx.purchase.update({
        where: { id: parseInt(id) },
        data: {
          totalAmount: totalAmount || existingPurchase.totalAmount,
          isUrgent: isUrgent !== undefined ? Boolean(isUrgent) : existingPurchase.isUrgent,
          expenses: expenses !== undefined ? expenses : existingPurchase.expenses,
          status: status || existingPurchase.status,
          updatedAt: new Date()
        }
      });

      // Создаем новые элементы если они переданы
      if (items && Array.isArray(items) && items.length > 0) {
        await tx.purchaseItem.createMany({
          data: items.map((item: any) => ({
            purchaseId: parseInt(id),
            quantity: item.quantity,
            costPrice: item.costPrice,
            total: item.total,
            productId: item.productId,
            productName: item.productName
          }))
        });
      }

      return purchase;
    });

    // Получаем обновленную закупку с элементами
    const finalPurchase = await prisma.purchase.findUnique({
      where: { id: parseInt(id) },
      include: { items: true }
    });

    return NextResponse.json(finalPurchase);
  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - удаление закупки
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const purchaseId = parseInt(id);

    if (isNaN(purchaseId)) {
      return NextResponse.json({ error: 'Invalid purchase ID' }, { status: 400 });
    }

    // Проверяем, что закупка принадлежит пользователю
    const purchase = await prisma.purchase.findFirst({
      where: {
        id: purchaseId,
        user: {
          email: session.user.email
        }
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Удаляем закупку (каскадное удаление товаров настроено в схеме)
    await prisma.purchase.delete({
      where: { id: purchaseId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 