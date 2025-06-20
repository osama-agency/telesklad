import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('user_id');
    const operation = searchParams.get('operation'); // 'earned', 'spent', 'all'
    
    const skip = (page - 1) * limit;

    // Строим условия фильтрации
    const where: any = {};
    
    if (userId) {
      where.user_id = BigInt(userId);
    }

    if (operation === 'earned') {
      where.bonus_amount = { gt: 0 };
    } else if (operation === 'spent') {
      where.bonus_amount = { lt: 0 };
    }

    // Получаем логи с пользователями
    const logs = await prisma.bonus_logs.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            tg_id: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit
    });

    // Получаем общее количество для пагинации
    const total = await prisma.bonus_logs.count({ where });

    // Трансформируем данные
    const transformedLogs = logs.map(log => ({
      id: log.id.toString(),
      user_id: log.user_id.toString(),
      user: {
        id: log.users.id.toString(),
        first_name: log.users.first_name,
        last_name: log.users.last_name,
        username: log.users.username,
        tg_id: log.users.tg_id.toString(),
        display_name: log.users.first_name || log.users.username || `User ${log.users.tg_id}`
      },
      bonus_amount: log.bonus_amount,
      reason: log.reason,
      source_type: log.source_type,
      source_id: log.source_id?.toString(),
      operation_type: (log.bonus_amount || 0) > 0 ? 'earned' : 'spent',
      created_at: log.created_at,
      updated_at: log.updated_at
    }));

    // Статистика
    const stats = await prisma.bonus_logs.aggregate({
      _sum: {
        bonus_amount: true
      },
      _count: {
        id: true
      },
      where
    });

    const earnedStats = await prisma.bonus_logs.aggregate({
      _sum: {
        bonus_amount: true
      },
      _count: {
        id: true
      },
      where: {
        ...where,
        bonus_amount: { gt: 0 }
      }
    });

    const spentStats = await prisma.bonus_logs.aggregate({
      _sum: {
        bonus_amount: true
      },
      _count: {
        id: true
      },
      where: {
        ...where,
        bonus_amount: { lt: 0 }
      }
    });

    return NextResponse.json({
      logs: transformedLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total_operations: stats._count.id,
        total_amount: stats._sum.bonus_amount || 0,
        earned: {
          operations: earnedStats._count.id,
          amount: earnedStats._sum.bonus_amount || 0
        },
        spent: {
          operations: spentStats._count.id,
          amount: Math.abs(spentStats._sum.bonus_amount || 0)
        }
      }
    });

  } catch (error) {
    console.error('Ошибка получения логов бонусов:', error);
    return NextResponse.json(
      { error: 'Ошибка получения логов бонусов' },
      { status: 500 }
    );
  }
} 