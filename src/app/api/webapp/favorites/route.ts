import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { UserService } from '@/lib/services/UserService';
import { S3Service } from '@/lib/services/s3';

// Функция для получения пользователя из запроса
async function getUserFromRequest(request: NextRequest) {
  // Пытаемся получить tg_id из параметров запроса
  const url = new URL(request.url);
  let tgId = url.searchParams.get('tg_id');
  
  // Если нет в параметрах, пытаемся получить из тела запроса
  if (!tgId) {
    try {
      const body = await request.json();
      tgId = body.tg_id;
    } catch {
      // Игнорируем ошибки парсинга JSON
    }
  }
  
  if (!tgId) {
    return null;
  }
  
  return await UserService.getUserByTelegramId(tgId);
}

// GET /api/webapp/favorites - получить список избранных товаров
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tgId = url.searchParams.get('tg_id');
    
    if (!tgId) {
      return NextResponse.json({ 
        error: 'tg_id parameter is required' 
      }, { status: 400 });
    }

    // Получаем пользователя через UserService
    const user = await UserService.getUserByTelegramId(tgId);
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Получаем избранные товары пользователя из базы данных
    const favorites = await prisma.favorites.findMany({
      where: {
        user_id: user.id
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            old_price: true,
            stock_quantity: true,
            image_url: true,
            show_in_webapp: true
          }
        }
      }
    });

    // Получаем изображения для всех товаров одним запросом
    const productIds = favorites.map(fav => Number(fav.products?.id)).filter(Boolean);
    const attachments = await prisma.active_storage_attachments.findMany({
      where: {
        record_type: 'Product',
        record_id: { in: productIds },
        name: 'image'
      },
      include: {
        active_storage_blobs: true
      }
    });

    // Создаем карту product_id -> blob_key
    const imageMap = new Map<number, string>();
    attachments.forEach(attachment => {
      imageMap.set(Number(attachment.record_id), attachment.active_storage_blobs.key);
    });

    // Преобразуем результат для фронтенда
    const result = favorites
      .filter(fav => fav.products?.show_in_webapp)
      .map(favorite => {
        const product = favorite.products;
        const productId = Number(product?.id);
        const blobKey = imageMap.get(productId);
        
        // Приоритет image_url из базы, затем из S3
        let imageUrl = product?.image_url;
        if (!imageUrl && blobKey) {
          imageUrl = S3Service.getImageUrl(blobKey);
        }
        
        console.log(`📦 Product ${product?.id}: stock_quantity = ${product?.stock_quantity}, name = ${product?.name}, image_url = ${imageUrl}`);
        return {
          id: Number(favorite.id),
          product_id: Number(product?.id),
          title: product?.name,
          price: product?.price,
          old_price: product?.old_price,
          stock_quantity: product?.stock_quantity || 0,
          is_in_stock: (product?.stock_quantity || 0) > 0,
          image_url: imageUrl,
          created_at: favorite.created_at
        };
      });

    console.log(`✅ Returning ${result.length} favorites for user ${user.id} (tg_id: ${tgId})`);
    console.log('Sample product data:', result[0]);

    return NextResponse.json({
      success: true,
      favorites: result,
      total: result.length
    });

  } catch (error: any) {
    console.error('Favorites API error:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    
    // Специальная обработка ошибок подключения к БД
    if (error?.message?.includes("Can't reach database server")) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error. Please try again later.',
          favorites: [],
          total: 0
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch favorites',
        favorites: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// POST /api/webapp/favorites - добавить товар в избранное
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, tg_id } = body;

    if (!product_id || !tg_id) {
      return NextResponse.json({ 
        error: 'product_id and tg_id are required' 
      }, { status: 400 });
    }

    // Получаем пользователя через UserService
    const user = await UserService.getUserByTelegramId(tg_id);
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Проверяем, есть ли уже такой товар в избранном
    const existingFavorite = await prisma.favorites.findFirst({
      where: {
        user_id: user.id,
        product_id: BigInt(product_id)
      }
    });

    if (existingFavorite) {
      return NextResponse.json({ 
        error: 'Product already in favorites' 
      }, { status: 409 });
    }

    // Добавляем товар в избранное
    const favorite = await prisma.favorites.create({
      data: {
        user_id: user.id,
        product_id: BigInt(product_id),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log(`✅ Product ${product_id} added to favorites for user ${user.id} (tg_id: ${tg_id})`);

    return NextResponse.json({ 
      success: true, 
      favorite: {
        id: Number(favorite.id),
        product_id: Number(favorite.product_id),
        user_id: Number(favorite.user_id)
      }
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE /api/webapp/favorites - удалить товар из избранного
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const product_id = url.searchParams.get('product_id');
    const tg_id = url.searchParams.get('tg_id');

    if (!product_id || !tg_id) {
      return NextResponse.json({ 
        error: 'product_id and tg_id are required' 
      }, { status: 400 });
    }

    // Получаем пользователя через UserService
    const user = await UserService.getUserByTelegramId(tg_id);
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    const deletedFavorite = await prisma.favorites.deleteMany({
      where: {
        user_id: user.id,
        product_id: BigInt(product_id)
      }
    });

    console.log(`✅ Product ${product_id} removed from favorites for user ${user.id} (tg_id: ${tg_id})`);

    return NextResponse.json({ 
      success: true, 
      deleted_count: deletedFavorite.count 
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
} 