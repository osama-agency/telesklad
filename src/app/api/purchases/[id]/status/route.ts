import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

// PUT - обновление статуса закупки
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`🔄 Updating purchase status for ID: ${params.id}`);

  try {
    const { status } = await request.json();
    const purchaseId = parseInt(params.id);

    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { error: 'Invalid purchase ID' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    console.log(`📝 Updating purchase #${purchaseId} status to: ${status}`);

    // Получаем текущую закупку
    const currentPurchase = await (prisma as any).purchases.findUnique({
      where: { id: purchaseId },
      include: {
        purchase_items: {
          include: {
            products: true
          }
        }
      }
    });

    if (!currentPurchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Обновляем статус в базе данных
    const updatedPurchase = await (prisma as any).purchases.update({
      where: { id: purchaseId },
      data: {
        status,
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

    console.log(`✅ Purchase #${purchaseId} status updated to: ${status}`);

    // Форматируем данные для Telegram
    const formattedPurchase = {
      id: updatedPurchase.id,
      totalAmount: updatedPurchase.totalamount || 0,
      status: updatedPurchase.status,
      isUrgent: updatedPurchase.isurgent || false,
      createdAt: updatedPurchase.createdat.toISOString(),
      supplierName: updatedPurchase.suppliername,
      notes: updatedPurchase.notes,
      items: updatedPurchase.purchase_items.map((item: any) => ({
        productName: item.productname,
        quantity: item.quantity,
        costPrice: item.costprice || 0,
        total: item.total || 0
      }))
    };

    // Обрабатываем изменение статуса и отправляем уведомления
    switch (status) {
      case 'awaiting_payment':
        // Поставщик отметил готовность к оплате - уведомляем админа
        console.log('💰 Notifying admin about payment readiness');
        await TelegramBotService.notifyAdminPaymentReady(formattedPurchase);
        
        // Обновляем сообщение у поставщика
        if (currentPurchase.telegrammessageid && currentPurchase.telegramchatid) {
          await TelegramBotService.updateSupplierPurchaseStatus(
            currentPurchase.telegramchatid,
            currentPurchase.telegrammessageid,
            formattedPurchase
          );
        }
        break;

      case 'paid':
        // Админ подтвердил оплату - уведомляем поставщика
        console.log('💸 Notifying supplier about payment confirmation');
        await TelegramBotService.notifySupplierPaymentConfirmed(formattedPurchase);
        
        // Обновляем сообщение у поставщика
        if (currentPurchase.telegrammessageid && currentPurchase.telegramchatid) {
          await TelegramBotService.updateSupplierPurchaseStatus(
            currentPurchase.telegramchatid,
            currentPurchase.telegrammessageid,
            formattedPurchase
          );
        }
        break;

      case 'shipped':
        // Поставщик передал в карго - уведомляем группу
        console.log('🚚 Notifying group about shipment');
        await TelegramBotService.notifyGroupShipped(formattedPurchase);
        
        // Обновляем сообщение у поставщика
        if (currentPurchase.telegrammessageid && currentPurchase.telegramchatid) {
          await TelegramBotService.updateSupplierPurchaseStatus(
            currentPurchase.telegramchatid,
            currentPurchase.telegrammessageid,
            formattedPurchase
          );
        }
        break;

      case 'cancelled':
        // Закупка отменена
        console.log('❌ Purchase cancelled');
        // Можно добавить уведомления об отмене
        break;

      default:
        console.log(`ℹ️ Status ${status} updated, no special notifications needed`);
    }

    return NextResponse.json({
      success: true,
      purchase: formattedPurchase,
      message: `Purchase status updated to ${status}`
    });

  } catch (error: any) {
    console.error('❌ Error updating purchase status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - получение текущего статуса закупки
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true,
        user: true,
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Возвращаем в формате для Telegram
    const telegramPurchase = {
      id: purchase.id,
      totalAmount: purchase.totalAmount,
      status: purchase.status,
      isUrgent: purchase.isUrgent,
      items: purchase.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.total,
      })),
      createdAt: purchase.createdAt.toISOString(),
    };

    return NextResponse.json(telegramPurchase);
  } catch (error) {
    console.error('Error fetching purchase status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 