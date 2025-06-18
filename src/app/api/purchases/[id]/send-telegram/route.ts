import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

// POST - отправить закупку закупщику в Telegram
export async function POST(
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

    // Получаем закупку с товарами
    const purchase = await (prisma as any).purchases.findUnique({
      where: { id: purchaseId },
      include: {
        purchase_items: {
          include: {
            products: true
          }
        }
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Формируем данные для Telegram
    const telegramPurchase = {
      id: purchase.id,
      totalAmount: purchase.totalamount,
      status: purchase.status,
      isUrgent: purchase.isurgent,
      items: purchase.purchase_items.map((item: any) => ({
        productName: item.productname,
        quantity: item.quantity,
        costPrice: item.unitcosttry || item.costprice, // используем себестоимость в лирах
        total: (item.unitcosttry || item.costprice) * item.quantity,
      })),
      createdAt: purchase.createdat.toISOString(),
      supplierName: purchase.suppliername,
      notes: purchase.notes,
    };

    // Отправляем в Telegram
    const result = await TelegramBotService.sendPurchaseToSupplier(telegramPurchase);

    if (result.success && result.messageId) {
      // Обновляем статус закупки
      await (prisma as any).purchases.update({
        where: { id: purchaseId },
        data: {
          status: 'sent_to_supplier',
          updatedat: new Date(),
          telegrammessageid: result.messageId,
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Purchase sent to supplier',
        telegramMessageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send to Telegram' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending purchase to Telegram:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 