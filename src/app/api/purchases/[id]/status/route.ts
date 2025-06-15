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

    // Обновляем статус
    const updatedPurchase = await prisma.purchase.update({
      where: { id: parseInt(id) },
      data: {
        status,
        updatedAt: new Date(),
        // Сохраняем ID сообщения Telegram для обновлений
        ...(telegramMessageId && { telegramMessageId }),
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