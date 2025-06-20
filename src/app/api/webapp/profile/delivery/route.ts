import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Фиксированный тестовый пользователь
const TEST_USER_ID = 9999;

// GET /api/webapp/profile/delivery - получить данные доставки
export async function GET(request: NextRequest) {
  try {
    console.log(`Getting delivery data for test user ${TEST_USER_ID}`);

    // Получаем данные пользователя
    const user = await prisma.users.findUnique({
      where: { id: TEST_USER_ID },
      select: {
        first_name: true,
        last_name: true,
        middle_name: true,
        phone_number: true,
        address: true,
        street: true,
        home: true,
        apartment: true,
        build: true,
        postal_code: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Преобразуем данные в нужный формат
    const deliveryData = {
      first_name: user.first_name || '',
      last_name: user.last_name || '', // отчество
      middle_name: user.middle_name || '', // фамилия
      phone_number: user.phone_number || '',
      address: user.address || '',
      street: user.street || '',
      home: user.home || '',
      apartment: user.apartment || '',
      build: user.build || '',
      postal_code: user.postal_code || 0
    };

    return NextResponse.json({
      success: true,
      data: deliveryData
    });

  } catch (error) {
    console.error('Delivery data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки данных доставки' },
      { status: 500 }
    );
  }
}

// PUT /api/webapp/profile/delivery - обновить данные доставки
export async function PUT(request: NextRequest) {
  try {
    const deliveryData = await request.json();
    console.log('Updating delivery data:', deliveryData);

    // Валидация обязательных полей
    const requiredFields = ['middle_name', 'first_name', 'phone_number', 'street', 'home'];
    const missingFields = requiredFields.filter(field => !deliveryData[field] || deliveryData[field].trim() === '');

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

    // Обновляем данные доставки пользователя
    const updatedUser = await prisma.users.update({
      where: { id: TEST_USER_ID },
      data: {
        first_name: deliveryData.first_name.trim(),
        last_name: deliveryData.last_name ? deliveryData.last_name.trim() : '', // отчество
        middle_name: deliveryData.middle_name.trim(), // фамилия
        phone_number: deliveryData.phone_number.trim(),
        address: deliveryData.address ? deliveryData.address.trim() : '',
        street: deliveryData.street.trim(),
        home: deliveryData.home.trim(),
        apartment: deliveryData.apartment ? deliveryData.apartment.trim() : '',
        build: deliveryData.build ? deliveryData.build.trim() : '',
        postal_code: deliveryData.postal_code ? parseInt(String(deliveryData.postal_code)) : null,
        updated_at: new Date()
      },
      select: {
        first_name: true,
        last_name: true,
        middle_name: true,
        phone_number: true,
        address: true,
        street: true,
        home: true,
        apartment: true,
        build: true,
        postal_code: true
      }
    });

    // Преобразуем обновленные данные
    const responseData = {
      first_name: updatedUser.first_name || '',
      last_name: updatedUser.last_name || '', // отчество
      middle_name: updatedUser.middle_name || '', // фамилия
      phone_number: updatedUser.phone_number || '',
      address: updatedUser.address || '',
      street: updatedUser.street || '',
      home: updatedUser.home || '',
      apartment: updatedUser.apartment || '',
      build: updatedUser.build || '',
      postal_code: updatedUser.postal_code || 0
    };

    console.log('Delivery data updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Данные доставки успешно обновлены',
      data: responseData
    });

  } catch (error) {
    console.error('Delivery data update error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления данных доставки' },
      { status: 500 }
    );
  }
} 