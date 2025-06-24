import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { S3Service } from '@/lib/services/s3';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (!productId) {
      return NextResponse.json(
        { error: 'Неверный ID товара' },
        { status: 400 }
      );
    }

    // Получаем отзывы для продукта (только одобренные)
    const reviews = await prisma.reviews.findMany({
      where: {
        product_id: productId,
        approved: true
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            username: true,
            photo_url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Фотографии теперь хранятся прямо в поле photos таблицы reviews

    // Трансформируем данные
    const transformedReviews = reviews.map(review => ({
      id: Number(review.id),
      content: review.content,
      rating: review.rating,
      created_at: review.created_at,
      user: {
        id: Number(review.users.id),
        first_name: review.users.first_name,
        last_name: review.users.last_name,
        username: review.users.username,
        photo_url: review.users.photo_url,
        display_name: review.users.first_name || review.users.username || `User ${review.users.id}`
      },
      photos: review.photos || []
    }));

    // Статистика рейтингов
    const ratings = reviews.map(r => r.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    // Подсчет процентного соотношения рейтингов
    const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: ratings.filter(r => r === rating).length,
      percentage: ratings.length > 0 ? (ratings.filter(r => r === rating).length / ratings.length) * 100 : 0
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      statistics: {
        total_count: reviews.length,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: ratingCounts
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить отзывы', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (!productId) {
      return NextResponse.json(
        { error: 'Неверный ID товара' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, rating, photos = [], tg_id } = body;

    // Валидация
    if (!content || content.length < 5 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Отзыв должен содержать от 5 до 1000 символов' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Рейтинг должен быть от 1 до 5' },
        { status: 400 }
      );
    }

    if (!tg_id) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Валидация фотографий
    if (photos && photos.length > 3) {
      return NextResponse.json(
        { error: 'Можно загрузить максимум 3 фотографии' },
        { status: 400 }
      );
    }

    // Проверяем, что все фотографии - валидные URL
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        try {
          new URL(photo);
          // Проверяем, что URL ведет на наш S3
          if (!photo.includes(process.env.S3_ENDPOINT || 'storage.beget.cloud')) {
            return NextResponse.json(
              { error: 'Недопустимый URL фотографии' },
              { status: 400 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: 'Недопустимый URL фотографии' },
            { status: 400 }
          );
        }
      }
    }

    // Находим пользователя
    const user = await prisma.users.findUnique({
      where: { tg_id: parseInt(tg_id) }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем, что пользователь покупал этот товар
    const userOrder = await prisma.orders.findFirst({
      where: {
        user_id: Number(user.id),
        status: 4, // SHIPPED
        order_items: {
          some: {
            product_id: productId
          }
        }
      },
      include: {
        order_items: true
      }
    });

    if (!userOrder) {
      return NextResponse.json(
        { error: 'Отзыв можно оставить только на товар, который вы приобрели' },
        { status: 403 }
      );
    }

    // Проверяем, что пользователь еще не оставил отзыв на этот товар
    const existingReview = await prisma.reviews.findFirst({
      where: {
        user_id: Number(user.id),
        product_id: productId
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Вы уже оставили отзыв на этот товар' },
        { status: 409 }
      );
    }

    // Создаем отзыв
    const now = new Date();
    const review = await prisma.reviews.create({
      data: {
        content,
        rating,
        photos: photos || [],
        user_id: Number(user.id),
        product_id: productId,
        approved: false, // Требует модерации
        created_at: now,
        updated_at: now
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Отзыв успешно отправлен и ожидает модерации',
      review_id: review.id
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Не удалось создать отзыв', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 