import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

interface ReceivePurchaseRequest {
  items: Array<{
    id: number; // ID элемента закупки
    receivedQuantity: number; // Фактически полученное количество
  }>;
  logisticsExpense?: number; // Расходы на логистику
  receivedAt: string; // Дата получения товара (ISO string)
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
    const { items, logisticsExpense, receivedAt, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ 
        error: 'Необходимо указать товары для оприходования' 
      }, { status: 400 });
    }

    if (!receivedAt) {
      return NextResponse.json({ 
        error: 'Необходимо указать дату получения товара' 
      }, { status: 400 });
    }

    // Валидация полученных количеств
    if (items.some(item => item.receivedQuantity < 0)) {
      return NextResponse.json({ 
        error: 'Полученное количество не может быть отрицательным' 
      }, { status: 400 });
    }

    // Получаем текущую закупку
    const purchase = await prisma.purchases.findUnique({
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
      return NextResponse.json({ error: 'Закупка не найдена' }, { status: 404 });
    }

    if (!purchase.status || !['paid', 'in_transit'].includes(purchase.status)) {
      return NextResponse.json({ 
        error: 'Закупка должна быть оплачена или в пути для оприходования' 
      }, { status: 400 });
    }

    const receivedDate = new Date(receivedAt);
    const createdDate = new Date(purchase.createdat);
    
    // Рассчитываем количество дней доставки
    const deliveryDays = Math.ceil((receivedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    // Обновляем закупку в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // 1. Обновляем статус закупки
      const updatedPurchase = await tx.purchases.update({
        where: { id: purchaseId },
        data: {
          status: 'received',
          updatedat: receivedDate,
        },
        include: { 
          purchase_items: {
            include: {
              products: true
            }
          }
        }
      });

      // 2. Обновляем остатки товаров на основе фактически полученного количества
      const receivedItems = [];
      for (const receivedItem of items) {
        const purchaseItem = updatedPurchase.purchase_items.find((item: any) => item.id === receivedItem.id);
        if (!purchaseItem) {
          throw new Error(`Товар с ID ${receivedItem.id} не найден в закупке`);
        }

        // Обновляем остаток товара
        if (receivedItem.receivedQuantity > 0) {
          await tx.products.update({
            where: { id: purchaseItem.productid },
            data: {
              stock_quantity: {
                increment: receivedItem.receivedQuantity
              }
            }
          });
        }

        receivedItems.push({
          id: purchaseItem.id,
          productId: purchaseItem.productid,
          productName: purchaseItem.products?.name,
          orderedQuantity: purchaseItem.quantity,
          receivedQuantity: receivedItem.receivedQuantity,
          difference: receivedItem.receivedQuantity - purchaseItem.quantity
        });
      }

      // 3. Создаем запись расхода на логистику, если указан
      let logisticsExpenseRecord = null;
      if (logisticsExpense && logisticsExpense > 0) {
        logisticsExpenseRecord = await tx.expenses.create({
          data: {
            amount: logisticsExpense,
            description: `Логистика для закупки #${purchaseId}`,
            category: 'Логистика',
            date: receivedAt,
            userid: purchase.userid
          }
        });
      }

      return {
        purchase: updatedPurchase,
        receivedItems,
        logisticsExpense: logisticsExpenseRecord,
        deliveryDays
      };
    });

    // Логирование для аналитики
    console.log(`📦 Закупка #${purchaseId} оприходована:`);
    console.log(`   - Дней доставки: ${deliveryDays}`);
    console.log(`   - Товаров получено: ${result.receivedItems.length}`);
    console.log(`   - Расходы на логистику: ${logisticsExpense || 0} ₽`);
    
    // Подготовка сводки по товарам
    const summary = {
      totalOrdered: result.receivedItems.reduce((sum, item) => sum + item.orderedQuantity, 0),
      totalReceived: result.receivedItems.reduce((sum, item) => sum + item.receivedQuantity, 0),
      partialItems: result.receivedItems.filter(item => item.difference < 0).length,
      overReceivedItems: result.receivedItems.filter(item => item.difference > 0).length,
      exactItems: result.receivedItems.filter(item => item.difference === 0).length
    };

    return NextResponse.json({
      success: true,
      data: {
        id: result.purchase.id,
        status: result.purchase.status,
        deliveryDays: result.deliveryDays,
        receivedDate,
        items: result.receivedItems,
        summary,
        logisticsExpense: logisticsExpense || 0,
        logisticsExpenseId: result.logisticsExpense?.id,
        notes,
      },
      message: `Закупка #${purchaseId} успешно оприходована за ${deliveryDays} дней. Получено ${summary.totalReceived} из ${summary.totalOrdered} товаров.`,
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