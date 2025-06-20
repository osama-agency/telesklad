import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Временный пользователь для демонстрации
// В реальном проекте ID будет из сессии/токена
const DEMO_USER_ID = 1;

// GET /api/webapp/profile - получить данные профиля
export async function GET(request: NextRequest) {
  try {
    // Получаем данные пользователя из базы данных
    const user = await prisma.users.findUnique({
      where: { id: DEMO_USER_ID },
      include: {
        account_tiers: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Получаем все уровни лояльности
    const accountTiers = await prisma.account_tiers.findMany({
      orderBy: { order_threshold: 'asc' }
    });

    // Вычисляем remaining_to_next_tier как в Rails
    const currentTier = user.account_tiers;
    const nextTier = accountTiers.find(tier => 
      currentTier ? tier.order_threshold > currentTier.order_threshold : tier.order_threshold > 0
    );
    const remainingToNextTier = nextTier 
      ? Math.max(nextTier.order_threshold - user.order_count, 0)
      : null; // Максимальный уровень достигнут

    // Преобразуем данные в нужный формат
    const userData = {
      id: Number(user.id),
      email: user.email,
      tg_id: Number(user.tg_id),
      username: user.username,
      first_name: user.first_name,
      first_name_raw: user.first_name_raw,
      last_name: user.last_name,
      last_name_raw: user.last_name_raw,
      middle_name: user.middle_name,
      phone_number: user.phone_number,
      photo_url: user.photo_url,
      address: user.address,
      street: user.street,
      home: user.home,
      apartment: user.apartment,
      build: user.build,
      postal_code: user.postal_code,
      bonus_balance: user.bonus_balance,
      order_count: user.order_count,
      account_tier: currentTier ? {
        id: Number(currentTier.id),
        title: currentTier.title,
        order_threshold: currentTier.order_threshold,
        bonus_percentage: currentTier.bonus_percentage,
        order_min_amount: currentTier.order_min_amount
      } : null,
      role: user.role,
      is_blocked: user.is_blocked,
      started: user.started
    };

    const transformedTiers = accountTiers.map(tier => ({
      id: Number(tier.id),
      title: tier.title,
      order_threshold: tier.order_threshold,
      bonus_percentage: tier.bonus_percentage,
      order_min_amount: tier.order_min_amount
    }));

    return NextResponse.json({
      success: true,
      user: userData,
      account_tiers: transformedTiers,
      remaining_to_next_tier: remainingToNextTier,
      next_tier: nextTier ? {
        id: Number(nextTier.id),
        title: nextTier.title,
        order_threshold: nextTier.order_threshold,
        bonus_percentage: nextTier.bonus_percentage,
        order_min_amount: nextTier.order_min_amount
      } : null
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки профиля' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/webapp/profile - обновить данные профиля
export async function PUT(request: NextRequest) {
  try {
    const userData = await request.json();

    // Валидация обязательных полей
    const requiredFields = ['middle_name', 'first_name', 'last_name', 'phone_number', 'email', 'address', 'street', 'home', 'postal_code'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Заполните обязательные поля',
          missing_fields: missingFields 
        },
        { status: 400 }
      );
    }

    // Обновляем данные пользователя в базе данных
    const updatedUser = await prisma.users.update({
      where: { id: DEMO_USER_ID },
      data: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        middle_name: userData.middle_name,
        phone_number: userData.phone_number,
        email: userData.email,
        address: userData.address,
        street: userData.street,
        home: userData.home,
        apartment: userData.apartment,
        build: userData.build,
        postal_code: userData.postal_code ? parseInt(userData.postal_code) : null,
        updated_at: new Date()
      },
      include: {
        account_tiers: true
      }
    });

    // Преобразуем обновленные данные
    const responseData = {
      id: Number(updatedUser.id),
      email: updatedUser.email,
      tg_id: Number(updatedUser.tg_id),
      username: updatedUser.username,
      first_name: updatedUser.first_name,
      first_name_raw: updatedUser.first_name_raw,
      last_name: updatedUser.last_name,
      last_name_raw: updatedUser.last_name_raw,
      middle_name: updatedUser.middle_name,
      phone_number: updatedUser.phone_number,
      photo_url: updatedUser.photo_url,
      address: updatedUser.address,
      street: updatedUser.street,
      home: updatedUser.home,
      apartment: updatedUser.apartment,
      build: updatedUser.build,
      postal_code: updatedUser.postal_code,
      bonus_balance: updatedUser.bonus_balance,
      order_count: updatedUser.order_count,
      account_tier: updatedUser.account_tiers,
      role: updatedUser.role,
      is_blocked: updatedUser.is_blocked,
      started: updatedUser.started
    };

    return NextResponse.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: responseData
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления профиля' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 