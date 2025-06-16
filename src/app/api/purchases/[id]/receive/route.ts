import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

interface ReceivePurchaseRequest {
  deliveryDays: number; // Количество дней доставки
  receivedQuantities?: { [productId: number]: number }; // Количество полученного товара
  additionalExpenses?: number; // Дополнительные расходы на логистику
  notes?: string; // Примечания при получении
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const purchaseId = parseInt(params.id);
    if (isNaN(purchaseId)) {
      return NextResponse.json({ error: 'Неверный ID закупки' }, { status: 400 });
    }

    const body: ReceivePurchaseRequest = await request.json();
    const { deliveryDays, receivedQuantities, additionalExpenses, notes } = body;

    if (!deliveryDays || deliveryDays <= 0) {
      return NextResponse.json({ 
        error: 'Необходимо указать количество дней доставки' 
      }, { status: 400 });
    }

    // Получаем текущую закупку
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Закупка не найдена' }, { status: 404 });
    }

    if (purchase.status !== 'in_transit') {
      return NextResponse.json({ 
        error: 'Закупка должна быть в статусе "В пути" для оприходования' 
      }, { status: 400 });
    }

    const receivedDate = new Date();

    // Обновляем закупку в транзакции
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // Обновляем статус закупки и добавляем информацию о доставке
      const updated = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: 'received',
          expenses: additionalExpenses 
            ? (purchase.expenses || 0) + Number(additionalExpenses) 
            : purchase.expenses,
          // Добавляем информацию о доставке в поле updatedAt как временное решение
          updatedAt: receivedDate,
        },
        include: { items: true }
      });

      // Если указаны полученные количества, обновляем остатки товаров
      if (receivedQuantities) {
        for (const item of updated.items) {
          const receivedQty = receivedQuantities[item.productId];
          if (receivedQty && receivedQty > 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock_quantity: {
                  increment: receivedQty
                }
              }
            });
          }
        }
      } else {
        // Если количества не указаны, добавляем все заказанное количество
        for (const item of updated.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock_quantity: {
                increment: item.quantity
              }
            }
          });
        }
      }

      return updated;
    });

    // Создаем/обновляем статистику поставщика (временно в отдельной таблице или файле)
    console.log(`📊 Закупка #${purchaseId} оприходована за ${deliveryDays} дней`);
    
    // TODO: Здесь будет обновление статистики поставщика после миграции
    // await SupplierStatsService.updateDeliveryStats(supplier, deliveryDays, orderDate, receivedDate);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPurchase.id,
        status: updatedPurchase.status,
        deliveryDays: deliveryDays,
        receivedDate,
        totalItems: updatedPurchase.items.length,
        additionalExpenses,
        notes,
      },
      message: `Закупка #${purchaseId} успешно оприходована. Доставка заняла ${deliveryDays} дней.`,
    });

  } catch (error) {
    console.error('Ошибка оприходования закупки:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при оприходовании закупки',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }, 
      { status: 500 }
    );
  }
} 