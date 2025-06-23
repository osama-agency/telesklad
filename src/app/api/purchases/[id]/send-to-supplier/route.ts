import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { TelegramService } from '@/lib/services/TelegramService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  console.log(`📤 Sending purchase to supplier, ID: ${resolvedParams.id}`);

  try {
    const purchaseId = parseInt(resolvedParams.id);

    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { error: 'Invalid purchase ID' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Проверяем, что закупка в статусе draft
    if (purchase.status !== 'draft') {
      return NextResponse.json(
        { error: `Purchase is already in status: ${purchase.status}` },
        { status: 400 }
      );
    }

    // Форматируем данные для Telegram
    const formattedPurchase = {
      id: purchase.id,
      totalAmount: purchase.totalamount || 0,
      status: 'sent_to_supplier',
      isUrgent: purchase.isurgent || false,
      createdAt: purchase.createdat.toISOString(),
      supplierName: purchase.suppliername,
      notes: purchase.notes,
      items: purchase.purchase_items.map((item: any) => ({
        productName: item.productname,
        quantity: item.quantity,
        costPrice: item.costprice || 0,
        total: item.total || 0
      }))
    };

    console.log(`🚀 Sending purchase #${purchaseId} to group via Telegram`);

    // Форматируем данные с себестоимостью в лирах для отправки в группу
      const itemsWithTRY = purchase.purchase_items.map((item: any) => ({
        productName: item.productname,
        quantity: item.quantity,
        costPrice: item.unitcosttry || 0, // используем себестоимость в лирах
        total: (item.unitcosttry || 0) * item.quantity
      }));

    const telegramPurchaseData = {
        ...formattedPurchase,
        items: itemsWithTRY
      };

    // Отправляем закупку в группу через Telegram
    const message = `📦 Новая закупка #${purchase.id}\n\nТовары: ${telegramPurchaseData.items.length} позиций\nСумма: ${telegramPurchaseData.totalAmount}₽`;
    const telegramResult = await TelegramService.call(message, process.env.TELEGRAM_GROUP_ID);

    if (telegramResult instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to send purchase to group via Telegram' },
        { status: 500 }
      );
    }

    // Обновляем статус закупки и сохраняем ID сообщения Telegram
    const updatedPurchase = await (prisma as any).purchases.update({
      where: { id: purchaseId },
      data: {
        status: 'sent_to_supplier',
        telegrammessageid: typeof telegramResult === 'number' ? telegramResult : null,
        telegramchatid: process.env.TELEGRAM_GROUP_CHAT_ID || '-4729817036',
        updatedat: new Date()
      },
      include: {
        purchase_items: {
          include: {
            products: true
          }
        }
      }
    });

    console.log(`✅ Purchase #${purchaseId} sent to supplier successfully`);

    return NextResponse.json({
      success: true,
      purchase: {
        id: updatedPurchase.id,
        status: updatedPurchase.status,
        telegramMessageId: updatedPurchase.telegrammessageid,
        telegramChatId: updatedPurchase.telegramchatid
      },
      message: 'Purchase sent to supplier successfully'
    });

  } catch (error: any) {
    console.error('❌ Error sending purchase to supplier:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 