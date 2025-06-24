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
        select: {
          id: true,
          first_name: true,
          last_name: true,
          middle_name: true,
          phone_number: true,
          email: true,
          address: true,
          street: true,
          home: true,
          apartment: true,
          build: true,
          postal_code: true
        }
      });
    } else if (tgId) {
      user = await prisma.users.findUnique({
        where: { tg_id: BigInt(tgId) },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          middle_name: true,
          phone_number: true,
          email: true,
          address: true,
          street: true,
          home: true,
          apartment: true,
          build: true,
          postal_code: true
        }
      });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        phone_number: user.phone_number || '',
        email: user.email || '',
        address: user.address || '',
        street: user.street || '',
        home: user.home || '',
        apartment: user.apartment || '',
        build: user.build || '',
        postal_code: user.postal_code || 0
      }
    });

  } catch (error) {
    console.error('Delivery data GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, tg_id, ...deliveryData } = body;

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

    // Обновляем данные доставки пользователя
    const updatedUser = await prisma.users.update({
      where: whereClause,
      data: {
        first_name: deliveryData.first_name,
        last_name: deliveryData.last_name,
        middle_name: deliveryData.middle_name,
        phone_number: deliveryData.phone_number,
        email: deliveryData.email,
        address: deliveryData.address,
        street: deliveryData.street,
        home: deliveryData.home,
        apartment: deliveryData.apartment,
        build: deliveryData.build,
        postal_code: deliveryData.postal_code ? parseInt(deliveryData.postal_code.toString()) : null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Данные для доставки успешно обновлены'
    });

  } catch (error) {
    console.error('Delivery data UPDATE error:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery data' },
      { status: 500 }
    );
  }
} 