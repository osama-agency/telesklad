import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Временный пользователь для демонстрации
// В реальном проекте ID будет из сессии/токена
const DEMO_USER_ID = 1;

// GET /api/webapp/favorites - получить список избранных товаров
export async function GET(request: NextRequest) {
  try {
    // Получаем избранные товары пользователя из базы данных
    const favorites = await prisma.favorites.findMany({
      where: {
        user_id: DEMO_USER_ID
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            old_price: true,
            stock_quantity: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Преобразуем данные в нужный формат
    const favoriteProducts = favorites.map(favorite => ({
      id: Number(favorite.products.id),
      name: favorite.products.name,
      price: Number(favorite.products.price || 0),
      old_price: favorite.products.old_price ? Number(favorite.products.old_price) : undefined,
      stock_quantity: Number(favorite.products.stock_quantity),
      favorited_at: favorite.created_at
    }));

    return NextResponse.json({
      success: true,
      favorites: favoriteProducts,
      count: favoriteProducts.length
    });

  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки избранного' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/webapp/favorites - добавить товар в избранное
export async function POST(request: NextRequest) {
  try {
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Не указан ID товара' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли товар
    const product = await prisma.products.findFirst({
      where: {
        id: parseInt(product_id),
        deleted_at: null
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Проверяем, не добавлен ли товар уже в избранное
    const existingFavorite = await prisma.favorites.findFirst({
      where: {
        user_id: DEMO_USER_ID,
        product_id: parseInt(product_id)
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: 'Товар уже в избранном' },
        { status: 400 }
      );
    }

    // Добавляем товар в избранное
    const favorite = await prisma.favorites.create({
      data: {
        user_id: DEMO_USER_ID,
        product_id: parseInt(product_id),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Добавлено в избранное',
      favorite_id: Number(favorite.id),
      product_id: parseInt(product_id)
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка добавления в избранное' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/webapp/favorites - удалить товар из избранного
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Не указан ID товара' },
        { status: 400 }
      );
    }

    // Удаляем товар из избранного
    const deleted = await prisma.favorites.deleteMany({
      where: {
        user_id: DEMO_USER_ID,
        product_id: parseInt(product_id)
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Товар не найден в избранном' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Удалено из избранного',
      product_id: parseInt(product_id)
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления из избранного' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 