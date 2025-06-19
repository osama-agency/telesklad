import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - получить все отзывы с пагинацией и фильтрацией
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const rating = searchParams.get('rating');
    const approved = searchParams.get('approved');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Построение фильтров
    const where: any = {};
    
    if (rating) {
      where.rating = parseInt(rating);
    }
    
    if (approved !== null && approved !== undefined) {
      where.approved = approved === 'true';
    }

    // Получение отзывов с данными пользователя и продукта
    const reviews = await prisma.reviews.findMany({
      where,
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
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc'
      },
      skip,
      take: limit,
    });

    // Подсчет общего количества
    const totalCount = await prisma.reviews.count({ where });

    // Статистика
    const stats = await prisma.reviews.aggregate({
      _avg: { rating: true },
      _count: { id: true },
      where: { approved: true }
    });

    // Распределение по рейтингам
    const ratingDistribution = await Promise.all([5, 4, 3, 2, 1].map(async (rating) => {
      const count = await prisma.reviews.count({
        where: { rating, approved: true }
      });
      return { rating, count };
    }));

    // Преобразуем BigInt в строки для JSON сериализации
    const serializedReviews = reviews.map(review => ({
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
    }));

    return NextResponse.json({
      reviews: serializedReviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.id || 0,
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении отзывов' },
      { status: 500 }
    );
  }
}

// POST - создать новый отзыв
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, product_id, content, rating } = body;

    // Валидация
    if (!user_id || !product_id || !content || !rating) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Рейтинг должен быть от 1 до 5' },
        { status: 400 }
      );
    }

    // Проверка, что отзыв от этого пользователя на этот продукт еще не существует
    const existingReview = await prisma.reviews.findUnique({
      where: {
        user_id_product_id: {
          user_id: BigInt(user_id),
          product_id: BigInt(product_id)
        }
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Отзыв на этот товар уже существует' },
        { status: 409 }
      );
    }

    const now = new Date();
    const review = await prisma.reviews.create({
      data: {
        user_id: BigInt(user_id),
        product_id: BigInt(product_id),
        content,
        rating: parseInt(rating),
        approved: false, // По умолчанию отзывы требуют одобрения
        created_at: now,
        updated_at: now,
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

    return NextResponse.json({ review: serializedReview }, { status: 201 });

  } catch (error) {
    console.error('Ошибка при создании отзыва:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании отзыва' },
      { status: 500 }
    );
  }
} 