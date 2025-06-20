import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Получаем все уровни лояльности
    const tiers = await prisma.account_tiers.findMany({
      orderBy: { order_threshold: 'desc' }
    });

    // Получаем всех пользователей
    const users = await prisma.users.findMany({
      select: {
        id: true,
        order_count: true,
        account_tier_id: true
      }
    });

    let updatedCount = 0;

    // Пересчитываем уровень для каждого пользователя
    for (const user of users) {
      // Находим подходящий уровень (максимальный, который пользователь может получить)
      const newTier = tiers.find(tier => user.order_count >= tier.order_threshold);
      
      if (newTier && user.account_tier_id !== newTier.id) {
        await prisma.users.update({
          where: { id: user.id },
          data: {
            account_tier_id: newTier.id,
            updated_at: new Date()
          }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Пересчитаны уровни для ${updatedCount} пользователей`,
      updatedCount
    });

  } catch (error) {
    console.error('Ошибка пересчета уровней:', error);
    return NextResponse.json(
      { error: 'Ошибка пересчета уровней лояльности' },
      { status: 500 }
    );
  }
} 