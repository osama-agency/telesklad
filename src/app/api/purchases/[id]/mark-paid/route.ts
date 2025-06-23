import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { TelegramService } from '@/lib/services/TelegramService';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  console.log(`💰 Marking purchase as paid, ID: ${resolvedParams.id}`);

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

    // Проверяем, что закупка в статусе sent_to_supplier или sent
    if (purchase.status !== 'sent_to_supplier' && purchase.status !== 'sent') {
      return NextResponse.json(
        { error: `Purchase must be in 'sent_to_supplier' or 'sent' status, current: ${purchase.status}` },
        { status: 400 }
      );
    }

    // Получаем актуальный курс лиры с буфером 5%
    let tryRateWithBuffer = null;
    try {
      const latestRate = await ExchangeRateService.getLatestRate('TRY');
      tryRateWithBuffer = Number(latestRate.rateWithBuffer);
      console.log(`💱 Using TRY rate with buffer for payment: ${tryRateWithBuffer} RUB per TRY`);
    } catch (error) {
      console.warn(`⚠️ Could not get TRY rate for payment, purchase will be marked as paid without exchange rate`);
    }

    // Обновляем статус закупки на 'paid' с сохранением курса и даты оплаты
    const updatedPurchase = await (prisma as any).purchases.update({
      where: { id: purchaseId },
      data: {
        status: 'paid',
        paiddate: new Date(),
        paidexchangerate: tryRateWithBuffer ? new Decimal(tryRateWithBuffer) : null,
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

    console.log(`💰 Purchase #${purchaseId} marked as paid with exchange rate: ${tryRateWithBuffer || 'N/A'}`);

    console.log(`🚀 Sending payment notification for purchase #${purchaseId} to group via Telegram`);

    // Подготавливаем данные для уведомления
    const purchaseData = {
      items: purchase.purchase_items.map((item: any) => ({
        productName: item.productname,
        quantity: item.quantity
      })),
      totalAmount: purchase.totalamount || 0,
      paidExchangeRate: tryRateWithBuffer || undefined
    };

          // Отправляем уведомление об оплате 
      const message = `💰 Закупка #${purchaseId} оплачена\n\nСумма: ${purchaseData.totalAmount}₽`;
      const telegramResult = await TelegramService.call(message, process.env.TELEGRAM_GROUP_ID);

      if (telegramResult instanceof Error) {
      console.warn('⚠️ Failed to send payment notification to Telegram, but purchase status updated');
    }

    console.log(`✅ Purchase #${purchaseId} marked as paid successfully`);

    return NextResponse.json({
      success: true,
      purchase: {
        id: updatedPurchase.id,
        status: updatedPurchase.status,
        totalAmount: updatedPurchase.totalamount,
        paidDate: updatedPurchase.paiddate,
        paidExchangeRate: updatedPurchase.paidexchangerate ? Number(updatedPurchase.paidexchangerate) : null
      },
      message: 'Purchase marked as paid successfully'
    });

  } catch (error: any) {
    console.error('❌ Error marking purchase as paid:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 