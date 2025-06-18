import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';
import InventoryTransitService from '@/lib/services/inventory-transit.service';

// PUT - обновление статуса закупки
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log(`🚀 PUT /api/purchases/[id]/status - ENTRY POINT`);
  const resolvedParams = await params;
  console.log(`🔄 Updating purchase status for ID: ${resolvedParams.id}`);

  try {
    const { status } = await request.json();
    const purchaseId = parseInt(resolvedParams.id);
    
    console.log(`📨 Received request body:`, { status });
    console.log(`🔢 Parsed purchase ID:`, purchaseId);

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
    console.log(`🔍 Current status check - incoming status: "${status}"`);

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
    console.log(`🎯 Checking status switch for: "${status}"`);
    
    // Управление товарами в транзите в зависимости от статуса
    const previousStatus = currentPurchase.status;
    await handleTransitStatusChange(purchaseId, previousStatus, status);
    
    switch (status) {
      case 'sent':
        // Статус изменен на "Отправлено" - отправляем только в группу
        console.log('📤 Purchase status changed to sent - sending group notification');
        
        try {
          // Отправляем уведомление в группу с правильными ценами
          const itemsWithTRY = updatedPurchase.purchase_items.map((item: any) => ({
            productName: item.productname,
            quantity: item.quantity,
            costPrice: item.unitcosttry || 0, // используем себестоимость в лирах
            total: (item.unitcosttry || 0) * item.quantity
          }));

          const totalAmountTRY = itemsWithTRY.reduce((sum: number, item: any) => sum + item.total, 0);

          const groupNotificationData = {
            ...formattedPurchase,
            status: 'sent_to_supplier',
            totalAmount: totalAmountTRY,
            items: itemsWithTRY
          };

          const groupResult = await TelegramBotService.notifyGroupNewPurchase(groupNotificationData);
          
          if (groupResult.success) {
            console.log(`✅ Уведомление о закупке #${purchaseId} отправлено в группу`);
            
            // Логируем данные перед сохранением
            console.log(`🔍 Saving to DB: messageId=${groupResult.messageId} (type: ${typeof groupResult.messageId}), chatId=${process.env.TELEGRAM_GROUP_CHAT_ID} (type: ${typeof process.env.TELEGRAM_GROUP_CHAT_ID})`);
            
            // Сохраняем ID сообщения в базе данных
            await (prisma as any).purchases.update({
              where: { id: purchaseId },
              data: {
                telegrammessageid: parseInt(groupResult.messageId?.toString() || '0'),
                telegramchatid: process.env.TELEGRAM_GROUP_CHAT_ID,
                updatedat: new Date()
              }
            });
          } else {
            console.error(`❌ Ошибка отправки уведомления в группу`);
          }
        } catch (telegramError) {
          console.error('⚠️ Ошибка отправки группового уведомления:', telegramError);
          // Не прерываем выполнение, если Telegram недоступен
        }
        break;

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

    const purchase = await (prisma as any).purchases.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchase_items: true,
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Возвращаем в формате для Telegram
    const telegramPurchase = {
      id: purchase.id,
      totalAmount: purchase.totalamount,
      status: purchase.status,
      isUrgent: purchase.isurgent,
      items: purchase.purchase_items.map((item: any) => ({
        productName: item.productname,
        quantity: item.quantity,
        costPrice: item.costprice,
        total: item.total,
      })),
      createdAt: purchase.createdat.toISOString(),
    };

    return NextResponse.json(telegramPurchase);
  } catch (error) {
    console.error('Error fetching purchase status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Обработка изменения статуса для управления товарами в транзите
 */
async function handleTransitStatusChange(
  purchaseId: number, 
  previousStatus: string | null, 
  newStatus: string
): Promise<void> {
  try {
    console.log(`🚛 Transit status change: ${previousStatus} → ${newStatus} for purchase #${purchaseId}`);

    // Добавляем товары в транзит при отправке к поставщику
    if (newStatus === 'sent' && previousStatus !== 'sent') {
      await InventoryTransitService.addItemsToTransit(purchaseId);
    }
    
    // Убираем товары из транзита и добавляем на склад при получении
    else if (newStatus === 'received' && previousStatus !== 'received') {
      await InventoryTransitService.removeItemsFromTransit(purchaseId);
    }
    
    // Отменяем товары в транзите при отмене закупки
    else if (newStatus === 'cancelled' && 
             previousStatus && 
             ['sent', 'awaiting_payment', 'paid', 'shipped'].includes(previousStatus)) {
      await InventoryTransitService.cancelItemsInTransit(purchaseId);
    }
    
    console.log(`✅ Transit status change handled for purchase #${purchaseId}`);
  } catch (error) {
    console.error(`❌ Error handling transit status change for purchase #${purchaseId}:`, error);
    // Не прерываем выполнение основной логики
  }
} 