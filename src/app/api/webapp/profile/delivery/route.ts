import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'user_id parameter is required' 
      }, { status: 400 });
    }

    // Получаем данные доставки пользователя
    const user = await prisma.users.findUnique({
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

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      delivery_data: {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        phone_number: user.phone_number || '',
        email: user.email || '',
        city: user.address || '',
        address: user.address || '',
        street: user.street || '',
        home: user.home || '',
        apartment: user.apartment || '',
        build: user.build || '',
        postal_code: user.postal_code ? user.postal_code.toString() : ''
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
    const { user_id, ...deliveryData } = body;

    if (!user_id) {
      return NextResponse.json({ 
        error: 'user_id is required' 
      }, { status: 400 });
    }

    // Обновляем данные доставки пользователя
    const updatedUser = await prisma.users.update({
      where: { id: BigInt(user_id) },
      data: {
        first_name: deliveryData.first_name,
        last_name: deliveryData.last_name,
        middle_name: deliveryData.middle_name,
        phone_number: deliveryData.phone_number,
        email: deliveryData.email,
        address: deliveryData.city || deliveryData.address,
        street: deliveryData.street,
        home: deliveryData.home,
        apartment: deliveryData.apartment,
        build: deliveryData.build,
        postal_code: deliveryData.postal_code ? parseInt(deliveryData.postal_code) : null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery data updated successfully'
    });

  } catch (error) {
    console.error('Delivery data UPDATE error:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery data' },
      { status: 500 }
    );
  }
} 