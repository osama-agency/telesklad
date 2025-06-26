import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE /api/webapp/subscriptions/[id] - удалить подписку
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subscriptionId = parseInt(id);

    if (isNaN(subscriptionId)) {
      return NextResponse.json(
        { success: false, error: 'Некорректный ID подписки' },
        { status: 400 }
      );
    }

    console.log(`Deleting subscription ${subscriptionId}`);

    // Проверяем, существует ли подписка
    const existingSubscription = await prisma.product_subscriptions.findUnique({
      where: { id: subscriptionId }
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'Подписка не найдена' },
        { status: 404 }
      );
    }

    // Удаляем подписку
    await prisma.product_subscriptions.delete({
      where: { id: subscriptionId }
    });

    console.log(`Successfully deleted subscription ${subscriptionId}`);

    return NextResponse.json({
      success: true,
      message: 'Подписка успешно удалена'
    });

  } catch (error) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении подписки' },
      { status: 500 }
    );
  }
} 