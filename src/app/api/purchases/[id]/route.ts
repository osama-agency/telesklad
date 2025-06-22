import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';
import { Decimal } from '@prisma/client/runtime/library';

// GET - получение конкретной закупки
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchaseId = parseInt(params.id);
    
    if (!purchaseId || isNaN(purchaseId)) {
      return NextResponse.json({ error: 'Invalid purchase ID' }, { status: 400 });
    }

    const purchase = await (prisma as any).purchases.findUnique({
      where: { id: purchaseId },
      include: {
        purchase_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Сериализуем данные
    const serializedPurchase = {
      id: String(purchase.id),
      userid: purchase.userid ? String(purchase.userid) : null,
      createdAt: purchase.createdat || new Date().toISOString(),
      updatedAt: purchase.updatedat || new Date().toISOString(),
      totalAmount: Number(purchase.totalamount || 0),
      status: purchase.status || 'draft',
      isUrgent: Boolean(purchase.isurgent || false),
      expenses: Number(purchase.expenses || 0),
      items: purchase.purchase_items?.map((item: any) => ({
        id: String(item.id),
        productId: String(item.productid),
        productName: item.productname || item.products?.name || 'Unknown Product',
        quantity: item.quantity || 0,
        costPrice: item.costprice || 0,
        total: item.total || 0,
        totalCostRub: item.totalcostrub ? Number(item.totalcostrub) : null,
        totalCostTry: item.totalcosttry ? Number(item.totalcosttry) : null,
        unitCostRub: item.unitcostrub ? Number(item.unitcostrub) : null,
        unitCostTry: item.unitcosttry ? Number(item.unitcosttry) : null
      })) || [],
      user: purchase.users ? {
        id: String(purchase.users.id),
        email: purchase.users.email,
        firstName: purchase.users.first_name,
        lastName: purchase.users.last_name
      } : null,
      telegramMessageId: purchase.telegrammessageid ? String(purchase.telegrammessageid) : null,
      telegramChatId: purchase.telegramchatid ? String(purchase.telegramchatid) : null,
      supplierName: purchase.suppliername || null,
      supplierPhone: purchase.supplierphone || null,
      supplierAddress: purchase.supplieraddress || null,
      notes: purchase.notes || null,
      deliveryDate: purchase.deliverydate || null,
      deliveryTrackingNumber: purchase.deliverytrackingnumber || null,
      deliveryStatus: purchase.deliverystatus || null,
      deliveryCarrier: purchase.deliverycarrier || null,
      deliveryNotes: purchase.deliverynotes || null,
      paymentButtonClicks: Number(purchase.paymentbuttonclicks || 0)
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
  { params }: { params: { id: string } }
) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const purchaseId = parseInt(params.id);
    
    if (!purchaseId || isNaN(purchaseId)) {
      return NextResponse.json({ error: 'Invalid purchase ID' }, { status: 400 });
    }

    console.log(`🗑️ Deleting purchase #${purchaseId}`);

    // Проверяем существование закупки
    const existingPurchase = await (prisma as any).purchases.findUnique({
      where: { id: purchaseId },
      include: {
        purchase_items: {
          include: {
            products: true
          }
        }
      }
    });

    if (!existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Проверяем статус закупки - нельзя удалять закупки в процессе
    if (existingPurchase.status === 'in_transit' || existingPurchase.status === 'received') {
      return NextResponse.json({ 
        error: 'Cannot delete purchase in transit or received status' 
      }, { status: 400 });
    }

    // Начинаем транзакцию для атомарного удаления
    await prisma.$transaction(async (tx) => {
      // Если закупка была отправлена, возвращаем товары из транзита
      if (existingPurchase.status === 'sent' || existingPurchase.status === 'paid') {
        for (const item of existingPurchase.purchase_items) {
          const product = await (tx as any).products.findUnique({
            where: { id: item.productid }
          });

          if (product && product.quantity_in_transit >= item.quantity) {
            await (tx as any).products.update({
              where: { id: item.productid },
              data: {
                quantity_in_transit: product.quantity_in_transit - item.quantity
              }
            });
            console.log(`📦 Returned ${item.quantity} units of product #${item.productid} from transit`);
          }
        }
      }

      // Удаляем элементы закупки (каскадное удаление настроено в схеме)
      await (tx as any).purchase_items.deleteMany({
        where: { purchaseid: purchaseId }
      });

      // Удаляем саму закупку
      await (tx as any).purchases.delete({
        where: { id: purchaseId }
      });
    });

    console.log(`✅ Purchase #${purchaseId} deleted successfully`);

    return NextResponse.json({ 
      success: true, 
      message: 'Purchase deleted successfully' 
    });

  } catch (error) {
    console.error('❌ Error deleting purchase:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Failed to delete purchase', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 