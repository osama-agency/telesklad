import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

// Функция для извлечения данных пользователя из Telegram initData
function extractTelegramUser(request: NextRequest) {
  const initData = request.headers.get('X-Telegram-Init-Data');
  
  if (initData) {
    try {
      const params = new URLSearchParams(initData);
      const user = params.get('user');
      if (user) {
        return JSON.parse(user);
      }
    } catch (error) {
      console.error('Error parsing Telegram initData:', error);
    }
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    let userId = url.searchParams.get('user_id');
    let tgId = url.searchParams.get('tg_id');
    
    // Попытка получить пользователя из Telegram initData
    if (!userId && !tgId) {
      const telegramUser = extractTelegramUser(request);
      if (telegramUser?.id) {
        tgId = telegramUser.id.toString();
      }
    }

    // Если все еще нет идентификатора пользователя, возвращаем ошибку
    if (!userId && !tgId) {
      return NextResponse.json({ 
        error: 'user_id or tg_id parameter is required' 
      }, { status: 400 });
    }

    // Ищем пользователя по user_id или tg_id
    let user;
    if (userId) {
      user = await prisma.users.findUnique({
        where: { id: BigInt(userId) },
        include: {
          account_tiers: true
        }
      });
    } else if (tgId) {
      user = await prisma.users.findUnique({
        where: { tg_id: BigInt(tgId) },
        include: {
          account_tiers: true
        }
      });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Получаем статистику заказов
    const orders = await prisma.orders.findMany({
      where: { user_id: user.id }
    });

    const orderStats = {
      total_orders: orders.length,
      total_spent: orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
      completed_orders: orders.filter(order => order.status === 4).length
    };

    // Формируем ответ
    const profileData = {
      id: Number(user.id),
      tg_id: user.tg_id.toString(),
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      phone_number: user.phone_number,
      email: user.email,
      address: user.address,
      street: user.street,
      home: user.home,
      apartment: user.apartment,
      build: user.build,
      postal_code: user.postal_code,
      bonus_balance: user.bonus_balance || 0,
      photo_url: user.photo_url,
      username: user.username,
      first_name_raw: user.first_name_raw,
      last_name_raw: user.last_name_raw,
      role: user.role || 0,
      order_count: user.order_count || 0,
      started: user.started,
      is_blocked: user.is_blocked,
      account_tier: user.account_tiers ? {
        id: Number(user.account_tiers.id),
        title: user.account_tiers.title,
        order_threshold: user.account_tiers.order_threshold,
        bonus_percentage: user.account_tiers.bonus_percentage
      } : null,
      order_stats: orderStats,
      created_at: user.created_at
    };

    // Получаем все уровни лояльности для отображения
    const allTiers = await prisma.account_tiers.findMany({
      orderBy: { order_threshold: 'asc' }
    })

    // Определяем следующий уровень и оставшееся количество заказов
    let nextTier = null
    let remainingToNextTier = null
    
    if (user.account_tiers) {
      // Находим следующий уровень
      const currentThreshold = user.account_tiers.order_threshold
      nextTier = allTiers.find(tier => tier.order_threshold > currentThreshold)
      
      if (nextTier) {
        remainingToNextTier = nextTier.order_threshold - (user.order_count || 0)
        // Добавляем поле orders_to_next для совместимости
        nextTier = {
          ...nextTier,
          id: Number(nextTier.id),
          orders_to_next: remainingToNextTier
        }
      }
    } else {
      // Если нет текущего уровня, следующий - первый
      nextTier = allTiers[0]
      if (nextTier) {
        remainingToNextTier = nextTier.order_threshold - (user.order_count || 0)
        nextTier = {
          ...nextTier,
          id: Number(nextTier.id),
          orders_to_next: remainingToNextTier
        }
      }
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
      user: profileData, // Для совместимости с существующим кодом
      account_tiers: allTiers.map(tier => ({
        id: Number(tier.id),
        title: tier.title,
        order_threshold: tier.order_threshold,
        bonus_percentage: tier.bonus_percentage,
        order_min_amount: tier.order_min_amount
      })),
      remaining_to_next_tier: remainingToNextTier,
      next_tier: nextTier
    });

  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, tg_id, ...updateData } = body;

    // Попытка получить пользователя из Telegram initData если не передан в теле
    let targetUserId = user_id;
    let targetTgId = tg_id;
    
    if (!targetUserId && !targetTgId) {
      const telegramUser = extractTelegramUser(request);
      if (telegramUser?.id) {
        targetTgId = telegramUser.id.toString();
      }
    }

    if (!targetUserId && !targetTgId) {
      return NextResponse.json({ 
        error: 'user_id or tg_id is required' 
      }, { status: 400 });
    }

    // Находим пользователя для обновления
    let whereClause;
    if (targetUserId) {
      whereClause = { id: BigInt(targetUserId) };
    } else {
      whereClause = { tg_id: BigInt(targetTgId) };
    }

    // Обновляем профиль пользователя
    const updatedUser = await prisma.users.update({
      where: whereClause,
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: Number(updatedUser.id),
        tg_id: updatedUser.tg_id.toString(),
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone_number: updatedUser.phone_number,
        email: updatedUser.email,
        address: updatedUser.address,
        street: updatedUser.street,
        home: updatedUser.home,
        apartment: updatedUser.apartment,
        build: updatedUser.build,
        postal_code: updatedUser.postal_code
      }
    });

  } catch (error) {
    console.error('Profile UPDATE error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 