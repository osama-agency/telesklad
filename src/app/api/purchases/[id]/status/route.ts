import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';
import { Decimal } from '@prisma/client/runtime/library';
import { serializeBigInts } from '@/lib/utils';

// Определяем возможные статусы закупки вручную
export type PurchaseStatus = 'pending' | 'sent' | 'paid' | 'shipped' | 'in_transit' | 'received' | 'cancelled';

const purchaseStatusMap: Record<string, PurchaseStatus> = {
  pending: 'pending',
  sent: 'sent',
  paid: 'paid',
  shipped: 'shipped',
  in_transit: 'in_transit',
  received: 'received',
  cancelled: 'cancelled'
};

// PUT - обновление статуса закупки
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;
    const purchaseId = parseInt(id);
    if (isNaN(purchaseId)) {
      return NextResponse.json({ error: 'Invalid purchase ID' }, { status: 400 });
    }

    const { status, paidDate } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    console.log(`💱 Updating purchase ${purchaseId} status to: ${status}`);

    // Получаем текущую закупку для проверки
    const existingPurchase = await (prisma as any).purchases.findUnique({
      where: { id: purchaseId },
      include: {
        purchase_items: true
      }
    });

    if (!existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      status,
      updatedat: new Date(),
    };

    // Если статус меняется на "paid", сохраняем курс на момент оплаты
    if (status === 'paid') {
      const paidDateObj = paidDate ? new Date(paidDate) : new Date();
      updateData.paiddate = paidDateObj;

      // Если у закупки есть totalcosttry, получаем актуальный курс
      if (existingPurchase.totalcosttry) {
        try {
          console.log('📈 Getting current TRY exchange rate for payment...');
          const exchangeRateData = await ExchangeRateService.getLatestRate('TRY');
          const currentRate = Number(exchangeRateData.rateWithBuffer);
          updateData.paidexchangerate = new Decimal(currentRate);
          
          console.log(`💰 Payment exchange rate saved: ${currentRate} for purchase ${purchaseId}`);
        } catch (error) {
          console.log('⚠️ Failed to get TRY exchange rate for payment:', error);
          // Продолжаем без курса, но логируем предупреждение
        }
      }
    }

    if (existingPurchase.status === 'received' && status !== 'received') {
      return NextResponse.json({ error: 'Cannot change status of a received purchase' }, { status: 400 });
    }

    // Обновляем закупку
    const updatedPurchase = await (prisma as any).purchases.update({
      where: { id: purchaseId },
      data: updateData,
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

    console.log(`✅ Purchase ${purchaseId} status updated to: ${status}`);

    return NextResponse.json(serializeBigInts(updatedPurchase));
  } catch (error) {
    console.error('❌ Error updating purchase status:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'Internal Server Error', 
        details: error.message,
        type: error.constructor.name 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}