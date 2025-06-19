import { NextRequest, NextResponse } from 'next/server';

// Временная структура пользователя для демонстрации
// В реальном проекте данные будут из базы данных
const mockUser = {
  id: 1,
  email: "user@example.com",
  tg_id: 123456789,
  username: "testuser",
  first_name: "Иван",
  first_name_raw: "Ivan",
  last_name: "Николаевич", 
  last_name_raw: "Smith",
  middle_name: "Иванов",
  phone_number: "+7 (999) 123-45-67",
  photo_url: null,
  address: "Москва",
  street: "Красная площадь",
  home: "1",
  apartment: "10",
  build: "А",
  postal_code: 101000,
  bonus_balance: 1250,
  order_count: 5,
  account_tier: {
    id: 2,
    title: "Серебряный",
    order_threshold: 5,
    bonus_percentage: 7,
    order_min_amount: 1000
  },
  role: 0, // 0: user, 1: manager, 2: moderator, 3: admin
  is_blocked: false,
  started: true
};

// Уровни лояльности для демонстрации
const mockAccountTiers = [
  { id: 1, title: "Бронзовый", order_threshold: 1, bonus_percentage: 5, order_min_amount: 500 },
  { id: 2, title: "Серебряный", order_threshold: 5, bonus_percentage: 7, order_min_amount: 1000 },
  { id: 3, title: "Золотой", order_threshold: 15, bonus_percentage: 10, order_min_amount: 2000 },
  { id: 4, title: "Платиновый", order_threshold: 30, bonus_percentage: 15, order_min_amount: 5000 }
];

// GET /api/webapp/profile - получить данные профиля
export async function GET(request: NextRequest) {
  try {
    // В реальном проекте здесь будет получение данных пользователя из БД
    // const session = await getServerSession(authOptions);
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   include: { account_tier: true }
    // });

    // Вычисляем remaining_to_next_tier как в Rails
    const currentTier = mockUser.account_tier;
    const nextTier = mockAccountTiers.find(tier => tier.order_threshold > currentTier.order_threshold);
    const remainingToNextTier = nextTier 
      ? Math.max(nextTier.order_threshold - mockUser.order_count, 0)
      : null; // Максимальный уровень достигнут

    return NextResponse.json({
      success: true,
      user: mockUser,
      account_tiers: mockAccountTiers,
      remaining_to_next_tier: remainingToNextTier,
      next_tier: nextTier
    });

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

    // В реальном проекте здесь будет обновление в БД
    // await prisma.user.update({
    //   where: { id: currentUser.id },
    //   data: userData
    // });

    return NextResponse.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user: { ...mockUser, ...userData }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления профиля' },
      { status: 500 }
    );
  }
} 