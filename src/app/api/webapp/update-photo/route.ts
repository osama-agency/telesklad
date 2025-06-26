import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/UserService';
import { prisma } from '@/libs/prismaDb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tg_id } = body;
    
    if (!tg_id) {
      return NextResponse.json({
        success: false,
        error: 'tg_id is required'
      }, { status: 400 });
    }

    // Проверяем существование пользователя
    const user = await prisma.users.findUnique({
      where: { tg_id: BigInt(tg_id) }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Обновляем фото профиля
    const photoUrl = await UserService.updateUserPhotoFromTelegram(tg_id);

    if (!photoUrl) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update photo - no photo found or API error'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      photo_url: photoUrl,
      message: 'Photo updated successfully'
    });

  } catch (error) {
    console.error('Error updating user photo:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update photo'
    }, { status: 500 });
  }
} 