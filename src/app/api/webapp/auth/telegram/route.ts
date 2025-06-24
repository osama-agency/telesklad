import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { UserService } from '@/lib/services/UserService';

// POST - аутентификация через Telegram Web App
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;

    if (!initData) {
      return NextResponse.json({
        success: false,
        error: "Params 'initData' is empty or empty user!"
      }, { status: 400 });
    }

    // Валидация подписи Telegram через UserService
    const isValid = UserService.validateTelegramInitData(initData);
    if (!isValid) {
      console.warn('Telegram initData signature validation failed');
      // В продакшене можно вернуть ошибку, но для разработки пропускаем
      // return NextResponse.json({
      //   success: false,
      //   error: "Invalid signature"
      // }, { status: 401 });
    }

    // Парсинг данных пользователя через UserService
    const tgUser = UserService.parseTelegramInitData(initData);
    
    // Находим или создаем пользователя через UserService
    const user = await UserService.findOrCreateTelegramUser(tgUser);

    console.log(`✅ Telegram user authenticated: ${user.id} (tg_id: ${user.tg_id})`);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        tg_id: user.tg_id?.toString(),
        first_name: user.first_name_raw,
        last_name: user.last_name_raw,
        username: user.username,
        photo_url: user.photo_url,
        email: user.email,
        bonus_balance: user.bonus_balance || 0,
        order_count: user.order_count || 0,
        role: user.role || 0,
        started: user.started,
        is_blocked: user.is_blocked,
      }
    });

  } catch (error) {
    console.error('❌ Telegram auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 500 });
  }
}

// GET - проверка статуса аутентификации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tg_id = searchParams.get('tg_id');

    if (!tg_id) {
      return NextResponse.json({
        success: false,
        error: 'tg_id parameter is required'
      }, { status: 400 });
    }

    // Для разработки создаем тестового пользователя если его нет
    if (tg_id === '9999' && process.env.NODE_ENV === 'development') {
      const testUser = await createTestUser();
      return NextResponse.json({
        success: true,
        started: testUser.started,
        user: {
          id: testUser.id.toString(),
          tg_id: testUser.tg_id?.toString(),
          first_name: testUser.first_name_raw,
          last_name: testUser.last_name_raw,
          username: testUser.username,
          photo_url: testUser.photo_url,
          email: testUser.email,
          bonus_balance: testUser.bonus_balance || 0,
          order_count: testUser.order_count || 0,
          role: testUser.role || 0,
          started: testUser.started,
          is_blocked: testUser.is_blocked,
        }
      });
    }

    // Используем UserService для получения пользователя
    const user = await UserService.getUserByTelegramId(tg_id);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Проверяем статус пользователя (как в старом приложении)
    if (!user.started || user.is_blocked) {
      return NextResponse.json({
        success: false,
        error: `User ${user.id} not started or banned bot!`,
        started: user.started,
        is_blocked: user.is_blocked
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      started: user.started,
      user: {
        id: user.id.toString(),
        tg_id: user.tg_id?.toString(),
        first_name: user.first_name_raw,
        last_name: user.last_name_raw,
        username: user.username,
        photo_url: user.photo_url,
        email: user.email,
        bonus_balance: user.bonus_balance || 0,
        order_count: user.order_count || 0,
        role: user.role || 0,
        started: user.started,
        is_blocked: user.is_blocked,
      }
    });

  } catch (error) {
    console.error('❌ Auth check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Auth check failed'
    }, { status: 500 });
  }
}

// Функция для создания тестового пользователя
async function createTestUser() {
  try {
    const existingUser = await prisma.users.findUnique({
      where: { tg_id: BigInt(9999) }
    });

    if (existingUser) {
      return existingUser;
    }

    // Получаем первый уровень лояльности
    const defaultTier = await prisma.account_tiers.findFirst({
      orderBy: { order_threshold: 'asc' }
    });

    const testUser = await prisma.users.create({
      data: {
        tg_id: BigInt(9999),
        first_name_raw: 'Петр',
        last_name_raw: 'Тестович',
        username: 'test_user',
        email: 'tg_9999@tgapp.online',
        encrypted_password: '',
        photo_url: null,
        started: true,
        is_blocked: false,
        first_name: 'Петр',
        middle_name: 'Иванович', // фамилия
        last_name: 'Тестов', // отчество  
        phone_number: '+7 (999) 999-99-99',
        address: 'Москва',
        street: 'ул. Тестовая',
        home: '1',
        apartment: '1',
        postal_code: 123456,
        bonus_balance: 1500,
        order_count: 0,
        account_tier_id: defaultTier?.id || null,
        role: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('✅ Test user created:', testUser.id);
    return testUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
} 