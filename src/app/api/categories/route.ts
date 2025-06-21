import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Получаем все уникальные категории из товаров
    const categories = await prisma.products.findMany({
      where: {
        ancestry: {
          not: null
        },
        deleted_at: null
      },
      select: {
        ancestry: true
      },
      distinct: ['ancestry']
    });

    // Преобразуем ancestry в удобный формат
    const categoryMap = new Map();
    
    categories.forEach(({ ancestry }) => {
      if (ancestry && ancestry.includes('/')) {
        const parts = ancestry.split('/');
        const categoryId = parts[parts.length - 1];
        
        // Определяем название категории по ID
        let categoryName = 'Неизвестная категория';
        switch (categoryId) {
          case '20':
            categoryName = 'СДВГ препараты';
            break;
          case '21':
            categoryName = 'Добавки и витамины';
            break;
          case '24':
            categoryName = 'Контрацептивы';
            break;
          case '36':
            categoryName = 'Другие препараты';
            break;
          case '2':
            categoryName = 'Лекарства';
            break;
          case '3':
            categoryName = 'БАДы';
            break;
          case '4':
            categoryName = 'Косметика';
            break;
          case '5':
            categoryName = 'Медицинские товары';
            break;
          default:
            categoryName = `Категория ${categoryId}`;
        }
        
        categoryMap.set(ancestry, {
          value: ancestry,
          label: categoryName,
          id: categoryId
        });
      }
    });

    // Преобразуем Map в массив и сортируем
    const formattedCategories = Array.from(categoryMap.values()).sort((a, b) => 
      a.label.localeCompare(b.label)
    );

    return NextResponse.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 