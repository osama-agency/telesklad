import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Фиксированный тестовый пользователь
const TEST_USER_ID = 9999;

// Функция для создания тестовых заказов
async function createTestOrders(userId: number) {
  try {
    // Получаем несколько товаров для заказов
    const products = await prisma.products.findMany({
      where: {
        deleted_at: null,
        price: { not: null }
      },
      take: 6,
      orderBy: { id: 'asc' }
    });

    if (products.length === 0) {
      console.log('No products found for test orders');
      return;
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Заказ 1: Доставлен (самый старый)
    const order1 = await prisma.orders.create({
      data: {
        user_id: userId,
        total_amount: Number(products[0].price) * 2 + Number(products[1].price),
        status: 3, // delivered
        created_at: oneMonthAgo,
        updated_at: oneMonthAgo,
        paid_at: oneMonthAgo,
        shipped_at: new Date(oneMonthAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
        tracking_number: 'TRK001',
        has_delivery: true,
        bonus: 50
      }
    });

    // Товары для заказа 1
    await prisma.order_items.createMany({
      data: [
        {
          order_id: order1.id,
          product_id: products[0].id,
          quantity: 2,
          price: products[0].price,
          name: products[0].name,
          created_at: oneMonthAgo,
          updated_at: oneMonthAgo
        },
        {
          order_id: order1.id,
          product_id: products[1].id,
          quantity: 1,
          price: products[1].price,
          name: products[1].name,
          created_at: oneMonthAgo,
          updated_at: oneMonthAgo
        }
      ]
    });

    // Заказ 2: Отправлен
    const order2 = await prisma.orders.create({
      data: {
        user_id: userId,
        total_amount: Number(products[2].price) + Number(products[3].price) * 3,
        status: 2, // shipped
        created_at: twoWeeksAgo,
        updated_at: twoWeeksAgo,
        paid_at: twoWeeksAgo,
        shipped_at: new Date(twoWeeksAgo.getTime() + 1 * 24 * 60 * 60 * 1000),
        tracking_number: 'TRK002',
        has_delivery: true,
        bonus: 75
      }
    });

    // Товары для заказа 2
    await prisma.order_items.createMany({
      data: [
        {
          order_id: order2.id,
          product_id: products[2].id,
          quantity: 1,
          price: products[2].price,
          name: products[2].name,
          created_at: twoWeeksAgo,
          updated_at: twoWeeksAgo
        },
        {
          order_id: order2.id,
          product_id: products[3].id,
          quantity: 3,
          price: products[3].price,
          name: products[3].name,
          created_at: twoWeeksAgo,
          updated_at: twoWeeksAgo
        }
      ]
    });

    // Заказ 3: Оплачен (недавний)
    const order3 = await prisma.orders.create({
      data: {
        user_id: userId,
        total_amount: Number(products[4].price) * 1 + Number(products[5].price) * 2,
        status: 1, // paid
        created_at: oneWeekAgo,
        updated_at: oneWeekAgo,
        paid_at: oneWeekAgo,
        has_delivery: true,
        bonus: 30
      }
    });

    // Товары для заказа 3
    await prisma.order_items.createMany({
      data: [
        {
          order_id: order3.id,
          product_id: products[4].id,
          quantity: 1,
          price: products[4].price,
          name: products[4].name,
          created_at: oneWeekAgo,
          updated_at: oneWeekAgo
        },
        {
          order_id: order3.id,
          product_id: products[5].id,
          quantity: 2,
          price: products[5].price,
          name: products[5].name,
          created_at: oneWeekAgo,
          updated_at: oneWeekAgo
        }
      ]
    });

    console.log('Test orders created successfully');
  } catch (error) {
    console.error('Error creating test orders:', error);
  }
}

// Функция для создания или получения тестового пользователя
async function ensureTestUser() {
  try {
    // Проверяем, есть ли тестовый пользователь
    let user = await prisma.users.findUnique({
      where: { id: TEST_USER_ID },
      include: {
        account_tiers: true
      }
    });

    if (user) {
      return user;
    }

    // Создаем тестового пользователя с фиксированным ID
    const defaultTier = await prisma.account_tiers.findFirst({
      orderBy: { order_threshold: 'asc' }
    });

    console.log(`Creating test user with ID ${TEST_USER_ID}`);

    const newUser = await prisma.users.create({
      data: {
        id: TEST_USER_ID,
        email: 'test@webapp.local',
        encrypted_password: '',
        tg_id: BigInt(999999999),
        username: 'test_user',
        first_name: 'Тест',
        first_name_raw: 'Тест',
        last_name: 'Пользователь', // это отчество в схеме
        last_name_raw: 'Пользователь',
        middle_name: 'Тестович', // это фамилия в схеме
        phone_number: '+7 (999) 999-99-99',
        address: 'Тестовый город',
        street: 'ул. Тестовая',
        home: '999',
        apartment: '999',
        postal_code: 999999,
        bonus_balance: 1000,
  order_count: 5,
        account_tier_id: defaultTier?.id || null,
        role: 0,
        is_blocked: false,
        started: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        account_tiers: true
      }
    });

    // Создаем тестовые заказы
    await createTestOrders(TEST_USER_ID);

    console.log(`Test user created: ${newUser.first_name} ${newUser.middle_name}`);
    return newUser;

  } catch (error) {
    console.error('Error ensuring test user:', error);
    throw error;
  }
}

// Функция для построения ответа профиля
async function buildProfileResponse(user: any, userId: number) {
  // Подсчитываем реальное количество заказов из базы
  const ordersCount = await prisma.orders.count({
    where: { 
      user_id: userId
    }
  });

  // Получаем все уровни лояльности
  const accountTiers = await prisma.account_tiers.findMany({
    orderBy: { order_threshold: 'asc' }
  });

  // Вычисляем remaining_to_next_tier используя реальное количество заказов
  const currentTier = user.account_tiers;
  const nextTier = accountTiers.find(tier => 
    currentTier ? tier.order_threshold > currentTier.order_threshold : tier.order_threshold > 0
  );
  const remainingToNextTier = nextTier 
    ? Math.max(nextTier.order_threshold - ordersCount, 0)
    : null;

  // Преобразуем данные в нужный формат
  const userData = {
    id: Number(user.id),
    email: user.email,
    tg_id: user.tg_id ? Number(user.tg_id) : null,
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
    order_count: ordersCount,
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

  console.log(`Profile loaded: ${userData.first_name} ${userData.middle_name}`);

  // Добавляем заголовки кэширования для персональных данных
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60'
  };

  const responseData = {
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
  };

  return new Response(JSON.stringify(responseData), { status: 200, headers });
}

// GET /api/webapp/profile - получить данные профиля
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Profile API: Getting user profile...');
    
    // Получаем tg_id из параметров запроса
    const { searchParams } = new URL(request.url);
    const tg_id = searchParams.get('tg_id');
    
    if (!tg_id) {
      // Для совместимости с существующим кодом, используем тестового пользователя
      if (process.env.NODE_ENV === 'development') {
        console.log(`Getting profile for test user ${TEST_USER_ID}`);
        const user = await ensureTestUser();
        return await buildProfileResponse(user, TEST_USER_ID);
      }
      
      console.error('❌ Profile API: tg_id parameter is required');
      return NextResponse.json({
        success: false,
        error: 'tg_id parameter is required'
      }, { status: 400 });
    }

    // Ищем пользователя по tg_id
    const user = await prisma.users.findUnique({
      where: { tg_id: BigInt(tg_id) },
      include: {
        account_tiers: true
      }
    });

    if (!user) {
      console.error(`❌ Profile API: User with tg_id ${tg_id} not found`);
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    console.log(`✅ Profile API: Retrieved user ${user.id} (tg_id: ${user.tg_id})`);
    return await buildProfileResponse(user, Number(user.id));

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки профиля' },
      { status: 500 }
    );
  }
}

// PUT /api/webapp/profile - обновить данные профиля
export async function PUT(request: NextRequest) {
  try {
    const userData = await request.json();

    // Убеждаемся что тестовый пользователь существует
    await ensureTestUser();

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

    // Обновляем данные пользователя
    const updatedUser = await prisma.users.update({
      where: { id: TEST_USER_ID },
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
  }
} 