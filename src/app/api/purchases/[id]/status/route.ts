import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

// PUT - обновление статуса закупки
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, telegramMessageId } = await request.json();

    // Проверяем авторизацию (для внутренних запросов можно пропустить)
    const session = await getServerSession();
    
    // Разрешаем доступ администраторам или внутренним запросам
    const isInternalRequest = !session;
    if (!isInternalRequest && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем закупку с товарами
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

    // При переходе в статус "paid" сохраняем текущий курс лиры
    let exchangeRateToSave = null;
    if (status === 'paid' && purchase.status !== 'paid') {
      try {
        // Получаем текущий курс лиры из базы
        const latestRate = await prisma.exchangeRate.findFirst({
          where: { currency: 'TRY' },
          orderBy: { effectiveDate: 'desc' }
        });
        
        if (latestRate) {
          exchangeRateToSave = latestRate.rate;
          console.log(`💰 Закупка #${id} оплачена. Курс лиры зафиксирован: ${exchangeRateToSave}`);
        }
      } catch (error) {
        console.error('Ошибка получения курса лиры:', error);
      }
    }

    // Обновляем статус
    const now = new Date();
    const updatedPurchase = await prisma.purchase.update({
      where: { id: parseInt(id) },
      data: {
        status,
        updatedAt: now,
        // Сохраняем ID сообщения Telegram для обновлений
        ...(telegramMessageId && { telegramMessageId }),
        // Если статус изменился на "sent", сохраняем дату оформления заказа
        // (временно используем поле updatedAt для отслеживания)
        ...(status === 'sent' && purchase.status !== 'sent' && {
          // После миграции здесь будет: orderDate: now
        }),
        // Если статус изменился на "paid", сохраняем курс лиры
        ...(exchangeRateToSave && {
          // После миграции здесь будет: exchangeRate: exchangeRateToSave
        }),
      },
      include: {
        items: true,
        user: true,
      }
    });

    // Возвращаем обновленную закупку в формате для Telegram
    const telegramPurchase = {
      id: updatedPurchase.id,
      totalAmount: updatedPurchase.totalAmount,
      status: updatedPurchase.status,
      isUrgent: updatedPurchase.isUrgent,
      items: updatedPurchase.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.total,
      })),
      createdAt: updatedPurchase.createdAt.toISOString(),
    };

    return NextResponse.json(telegramPurchase);
  } catch (error) {
    console.error('Error updating purchase status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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