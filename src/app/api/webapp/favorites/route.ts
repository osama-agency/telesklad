import { NextRequest, NextResponse } from 'next/server';

// GET /api/webapp/favorites - получить список избранных товаров
export async function GET(request: NextRequest) {
  try {
    // Для демонстрации возвращаем успешный ответ
    // В реальном проекте здесь будет загрузка из БД
    return NextResponse.json({
      success: true,
      message: 'Favorites API работает'
    });

  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки избранного' },
      { status: 500 }
    );
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

    // В реальном проекте здесь будет создание записи в БД
    // Для демонстрации просто возвращаем успех
    return NextResponse.json({
      success: true,
      message: 'Добавлено в избранное',
      product_id: parseInt(product_id)
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка добавления в избранное' },
      { status: 500 }
    );
  }
} 