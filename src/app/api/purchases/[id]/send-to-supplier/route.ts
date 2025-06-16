import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`📤 Sending purchase to supplier, ID: ${params.id}`);

  try {
    const purchaseId = parseInt(params.id);

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

    console.log(`🚀 Sending purchase #${purchaseId} to supplier via Telegram`);

    // Отправляем закупку поставщику через Telegram
    const telegramResult = await TelegramBotService.sendPurchaseToSupplier(formattedPurchase);

    if (!telegramResult.success) {
      return NextResponse.json(
        { error: 'Failed to send purchase to supplier via Telegram' },
        { status: 500 }
      );
    }

    // Обновляем статус закупки и сохраняем ID сообщения Telegram
    const updatedPurchase = await (prisma as any).purchases.update({
      where: { id: purchaseId },
      data: {
        status: 'sent_to_supplier',
        telegrammessageid: telegramResult.messageId,
        telegramchatid: process.env.TELEGRAM_SUPPLIER_ID || '7828956680',
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