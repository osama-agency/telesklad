import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';
import { Decimal } from '@prisma/client/runtime/library';

// GET - получение конкретной закупки
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseId = parseInt(id);

    const purchase = await (prisma as any).purchases.findUnique({
      where: { id: purchaseId }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Загружаем элементы закупки
    const purchaseItems = await (prisma as any).purchase_items.findMany({
      where: { purchaseid: purchaseId }
    });

    const serializedPurchase = {
      ...purchase,
      id: purchase.id.toString(),
      userid: purchase.userid ? purchase.userid.toString() : null,
      createdAt: purchase.createdat || new Date().toISOString(),
      updatedAt: purchase.updatedat || new Date().toISOString(),
      totalAmount: purchase.totalamount || 0,
      isUrgent: purchase.isurgent || false,
      items: purchaseItems.map((item: any) => ({
        id: item.id.toString(),
        productId: item.productid ? item.productid.toString() : null,
        productName: item.productname || 'Unknown Product',
        quantity: item.quantity || 0,
        costPrice: item.costprice || 0,
        total: item.total || 0
      }))
    };

    return NextResponse.json(serializedPurchase);
  } catch (error) {
    console.error('❌ Error fetching purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - обновление закупки
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseId = parseInt(id);
    const { items, totalAmount, isUrgent, expenses, status, currency = 'TRY' } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    if (!totalAmount || typeof totalAmount !== 'number') {
      return NextResponse.json({ error: 'Total amount is required' }, { status: 400 });
    }

    // Проверяем, существует ли закупка
    const existingPurchase = await (prisma as any).purchases.findUnique({
      where: { id: purchaseId }
    });

    if (!existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Начинаем транзакцию для атомарности операций
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // Обновляем закупку
      const purchase = await (tx as any).purchases.update({
        where: { id: purchaseId },
        data: {
          totalamount: totalAmount,
          isurgent: Boolean(isUrgent),
          expenses: expenses || null,
          status: status || 'draft',
          updatedat: new Date()
        }
      });

      // Удаляем старые элементы закупки
      await (tx as any).purchase_items.deleteMany({
        where: { purchaseid: purchaseId }
      });

      // Создаем новые элементы закупки
      const purchaseItems = [];
      for (const item of items) {
        const purchaseItem = await (tx as any).purchase_items.create({
          data: {
            purchaseid: purchaseId,
            quantity: parseInt(item.quantity),
            costprice: parseFloat(item.costPrice),
            total: parseFloat(item.total),
            productid: parseInt(item.productId),
            productname: item.productName || `Product ${item.productId}`
          }
        });
        purchaseItems.push(purchaseItem);
      }

      return {
        ...purchase,
        items: purchaseItems
      };
    });

    // Преобразуем BigInt поля в строки для JSON сериализации
    const serializedPurchase = {
      ...updatedPurchase,
      id: updatedPurchase.id.toString(),
      userid: updatedPurchase.userid ? updatedPurchase.userid.toString() : null,
      createdAt: updatedPurchase.createdat || new Date().toISOString(),
      updatedAt: updatedPurchase.updatedat || new Date().toISOString(),
      totalAmount: updatedPurchase.totalamount || 0,
      isUrgent: updatedPurchase.isurgent || false,
      items: updatedPurchase.items?.map((item: any) => ({
        ...item,
        id: item.id.toString(),
        purchaseid: item.purchaseid ? item.purchaseid.toString() : null,
        productid: item.productid ? item.productid.toString() : null,
        productId: item.productid ? item.productid.toString() : null,
        productName: item.productname || 'Unknown Product',
        quantity: item.quantity || 0,
        costPrice: item.costprice || 0,
        total: item.total || 0
      })) || [],
    };

    return NextResponse.json(serializedPurchase);
  } catch (error) {
    console.error('❌ Error updating purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - удаление закупки
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseId = parseInt(id);

    // Проверяем, существует ли закупка
    const existingPurchase = await (prisma as any).purchases.findUnique({
      where: { id: purchaseId }
    });

    if (!existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Удаляем закупку и связанные элементы в транзакции
    await prisma.$transaction(async (tx) => {
      // Сначала удаляем элементы закупки
      await (tx as any).purchase_items.deleteMany({
        where: { purchaseid: purchaseId }
      });

      // Затем удаляем саму закупку
      await (tx as any).purchases.delete({
      where: { id: purchaseId }
      });
    });

    return NextResponse.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting purchase:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 