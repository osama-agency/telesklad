import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - одобрить/отклонить отзыв
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { approved } = await request.json();
    const params = await context.params;
    const reviewId = params.id;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Поле approved должно быть boolean' },
        { status: 400 }
      );
    }

    const review = await prisma.reviews.update({
      where: {
        id: BigInt(reviewId)
      },
      data: {
        approved,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            photo_url: true,
          }
        },
        products: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Преобразуем BigInt в строки для JSON сериализации
    const serializedReview = {
      ...review,
      id: review.id.toString(),
      user_id: review.user_id.toString(),
      product_id: review.product_id.toString(),
      users: {
        ...review.users,
        id: review.users.id.toString(),
      },
      products: {
        ...review.products,
        id: review.products.id.toString(),
      }
    };

    return NextResponse.json({ review: serializedReview });

  } catch (error) {
    console.error('Ошибка при обновлении отзыва:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении отзыва' },
      { status: 500 }
    );
  }
} 