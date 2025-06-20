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
        { error: 'Invalid product ID' },
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

    // Получаем фотографии отзывов
    const reviewIds = reviews.map(r => Number(r.id));
    const attachments = await prisma.active_storage_attachments.findMany({
      where: {
        record_type: 'Review',
        record_id: { in: reviewIds },
        name: 'photos'
      },
      include: {
        active_storage_blobs: true
      }
    });

    // Создаем карту фотографий по review_id
    const photosMap = new Map<number, string[]>();
    attachments.forEach(attachment => {
      const reviewId = Number(attachment.record_id);
      if (!photosMap.has(reviewId)) {
        photosMap.set(reviewId, []);
      }
      photosMap.get(reviewId)!.push(S3Service.getImageUrl(attachment.active_storage_blobs.key));
    });

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
      photos: photosMap.get(Number(review.id)) || []
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
      { error: 'Failed to fetch reviews', details: error instanceof Error ? error.message : String(error) },
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
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, rating, tg_id } = body;

    // Валидация
    if (!content || content.length < 5 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Content must be between 5 and 1000 characters' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!tg_id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Находим пользователя
    const user = await prisma.users.findUnique({
      where: { tg_id: parseInt(tg_id) }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
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
        { error: 'You can only review products you have purchased' },
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
        { error: 'You have already reviewed this product' },
        { status: 409 }
      );
    }

    // Создаем отзыв
    const now = new Date();
    const review = await prisma.reviews.create({
      data: {
        content,
        rating,
        user_id: Number(user.id),
        product_id: productId,
        approved: false, // Требует модерации
        created_at: now,
        updated_at: now
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully and is pending moderation',
      review_id: review.id
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 