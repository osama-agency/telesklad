import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tgId = searchParams.get('tg_id');

    if (!tgId) {
      return NextResponse.json({ error: 'tg_id обязателен' }, { status: 400 });
    }

    // Получаем пользователя с информацией об уровне лояльности
    const user = await prisma.users.findUnique({
      where: { tg_id: BigInt(tgId) },
      include: {
        account_tiers: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Получаем все уровни лояльности для определения следующего
    const allTiers = await prisma.account_tiers.findMany({
      orderBy: { order_threshold: 'asc' }
    });

    // Получаем настройки системы лояльности
    const bonusThreshold = await prisma.settings.findUnique({
      where: { variable: 'bonus_threshold' }
    });

    const deliveryPrice = await prisma.settings.findUnique({
      where: { variable: 'delivery_price' }
    });

    // Определяем следующий уровень
    const currentTier = user.account_tiers;
    const nextTier = allTiers.find(tier => 
      tier.order_threshold > (currentTier?.order_threshold || 0)
    );

    return NextResponse.json({
      user: {
        id: user.id.toString(),
        bonus_balance: user.bonus_balance,
        order_count: user.order_count,
        current_tier: currentTier ? {
          id: currentTier.id.toString(),
          title: currentTier.title,
          bonus_percentage: currentTier.bonus_percentage,
          order_threshold: currentTier.order_threshold
        } : null,
        next_tier: nextTier ? {
          id: nextTier.id.toString(),
          title: nextTier.title,
          bonus_percentage: nextTier.bonus_percentage,
          order_threshold: nextTier.order_threshold,
          orders_to_next: Math.max(0, nextTier.order_threshold - user.order_count)
        } : null
      },
      settings: {
        bonus_threshold: parseInt(bonusThreshold?.value || '5000'),
        delivery_price: parseInt(deliveryPrice?.value || '500')
      },
      all_tiers: allTiers.map(tier => ({
        id: tier.id.toString(),
        title: tier.title,
        bonus_percentage: tier.bonus_percentage,
        order_threshold: tier.order_threshold
      }))
    });

  } catch (error) {
    console.error('Ошибка получения информации о лояльности:', error);
    return NextResponse.json(
      { error: 'Ошибка получения информации о лояльности' },
      { status: 500 }
    );
  }
} 