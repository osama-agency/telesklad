import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Получение всех настроек
export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    
    // Преобразуем в удобный формат
    const settingsMap = settings.reduce((acc, setting) => {
      if (setting.variable) {
        acc[setting.variable] = setting.value || '';
      }
      return acc;
    }, {} as Record<string, string>);

    // Получаем уровни лояльности
    const loyaltyTiers = await prisma.account_tiers.findMany({
      orderBy: { order_threshold: 'asc' }
    });

    // Получаем статистику по заказам пользователей
    const orderStats = await prisma.users.groupBy({
      by: ['order_count'],
      _count: {
        id: true
      },
      orderBy: {
        order_count: 'asc'
      }
    });

    // Получаем общую статистику
    const totalUsers = await prisma.users.count();
    const usersWithOrders = await prisma.users.count({
      where: {
        order_count: {
          gt: 0
        }
      }
    });

    return NextResponse.json({
      settings: settingsMap,
      loyaltyTiers: loyaltyTiers.map(tier => ({
        id: tier.id.toString(),
        title: tier.title,
        bonus_percentage: tier.bonus_percentage,
        order_threshold: tier.order_threshold,
        order_min_amount: tier.order_min_amount
      })),
      orderStats: {
        totalUsers,
        usersWithOrders,
        distribution: orderStats.map(stat => ({
          orderCount: stat.order_count,
          userCount: stat._count.id
        }))
      }
    });

  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    return NextResponse.json(
      { error: 'Ошибка получения настроек' },
      { status: 500 }
    );
  }
}

// Обновление настроек
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings, loyaltyTiers } = body;

    // Обновляем обычные настройки
    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.settings.upsert({
          where: { variable: key },
          update: { 
            value: String(value),
            updated_at: new Date()
          },
          create: {
            variable: key,
            value: String(value),
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }
    }

    // Обновляем уровни лояльности
    if (loyaltyTiers && Array.isArray(loyaltyTiers)) {
      for (const tier of loyaltyTiers) {
        if (tier.id && tier.id !== 'new') {
          await prisma.account_tiers.update({
            where: { id: BigInt(tier.id) },
            data: {
              title: tier.title,
              bonus_percentage: parseInt(tier.bonus_percentage),
              order_threshold: parseInt(tier.order_threshold),
              order_min_amount: parseInt(tier.order_min_amount || 0),
              updated_at: new Date()
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения настроек' },
      { status: 500 }
    );
  }
} 