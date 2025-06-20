import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tgId = searchParams.get('tg_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!tgId) {
      return NextResponse.json({ error: 'tg_id обязателен' }, { status: 400 });
    }

    // Получаем пользователя
    const user = await prisma.users.findUnique({
      where: { tg_id: BigInt(tgId) }
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Получаем историю бонусов с пагинацией
    const [bonusLogs, totalCount] = await Promise.all([
      prisma.bonus_logs.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: (page - 1) * limit
      }),
      prisma.bonus_logs.count({
        where: { user_id: user.id }
      })
    ]);

    // Преобразуем данные для фронтенда
    const formattedLogs = bonusLogs.map(log => ({
      id: log.id.toString(),
      bonus_amount: log.bonus_amount,
      reason: log.reason,
      source_type: log.source_type,
      source_id: log.source_id?.toString(),
      created_at: log.created_at.toISOString(),
      description: getReasonDescription(log.reason, log.bonus_amount)
    }));

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Ошибка получения истории бонусов:', error);
    return NextResponse.json(
      { error: 'Ошибка получения истории бонусов' },
      { status: 500 }
    );
  }
}

function getReasonDescription(reason: string | null, amount: number | null): string {
  if (!reason || !amount) return 'Неизвестная операция';
  
  switch (reason) {
    case 'order':
      return `Начислен кэшбек за заказ: +${amount}₽`;
    case 'order_deduct':
      return `Потрачены бонусы в заказе: ${amount}₽`;
    case 'manual':
      return amount > 0 ? `Начислены бонусы: +${amount}₽` : `Списаны бонусы: ${amount}₽`;
    default:
      return amount > 0 ? `Начислены бонусы: +${amount}₽` : `Списаны бонусы: ${amount}₽`;
  }
} 