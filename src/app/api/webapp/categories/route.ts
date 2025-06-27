import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

export const revalidate = 0;

export async function GET() {
  console.log('[API_CATEGORIES] Request started');
  
  try {
    // Получаем все категории (записи с ancestry = 23)
    const categories = await prisma.products.findMany({
      where: {
        ancestry: '23',
        deleted_at: null,
        show_in_webapp: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log('[API_CATEGORIES] Found categories:', categories);

    // Подсчитываем количество товаров в каждой категории
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.products.count({
          where: {
            show_in_webapp: true,
            deleted_at: null,
            ancestry: {
              startsWith: `23/${category.id}`,
            },
          },
        });

        return {
          id: category.id.toString(),
          name: category.name || 'Без названия',
          count,
        };
      })
    );
    
    // Фильтруем категории с количеством > 0
    const validCategories = categoriesWithCount.filter(cat => cat.count > 0);

    console.log('[API_CATEGORIES] Returning categories:', validCategories);
    return NextResponse.json({ categories: validCategories });

  } catch (error) {
    console.error('[API_CATEGORIES_ERROR] Full error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
