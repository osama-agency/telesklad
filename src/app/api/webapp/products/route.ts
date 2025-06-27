import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { S3Service } from '@/lib/services/s3';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  console.log('[API_PRODUCTS] Request started');
  
  try {
    const { searchParams } = new URL(request.url);
    const tgId = searchParams.get('tg_id');
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    console.log('[API_PRODUCTS] tg_id:', tgId);
    console.log('[API_PRODUCTS] search:', search);
    console.log('[API_PRODUCTS] brand:', brand);
    console.log('[API_PRODUCTS] category:', category);

    console.log('[API_PRODUCTS] Fetching products...');
    const products = await prisma.products.findMany({
      where: {
        show_in_webapp: true,
        deleted_at: null,
        // Исключаем категории - берем только товары с ancestry содержащим "/"
        // Но если указана категория, фильтруем по ней
        ...(category ? {
          ancestry: {
            startsWith: `23/${category}`,
          },
        } : {
          ancestry: {
            contains: '/',
          },
        }),
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
        ...(brand && {
          brand: brand,
        }),
      },
      select: {
        id: true,
        name: true,
        price: true,
        old_price: true,
        stock_quantity: true,
        image_url: true,
      },
      orderBy: { id: 'desc' },
    });
    
    // Получаем изображения из ActiveStorage для всех товаров
    const productIds = products.map(p => Number(p.id));
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
    
    // Создаем мапу изображений по product_id
    const imageMap = new Map();
    console.log('[API_PRODUCTS] Found attachments:', attachments.length);
    attachments.forEach(attachment => {
      const imageUrl = S3Service.getImageUrl(attachment.active_storage_blobs.key);
      const productId = Number(attachment.record_id); // Приводим к числу
      console.log('[API_PRODUCTS] Mapping product', productId, 'to image:', imageUrl);
      imageMap.set(productId, imageUrl);
    });
    console.log('[API_PRODUCTS] Found products:', products.length);

    let subscribedIds = new Set();
    if (tgId) {
      try {
        console.log('[API_PRODUCTS] Looking for user with tg_id:', tgId);
        const user = await prisma.users.findUnique({
          where: { tg_id: BigInt(tgId) },
          select: { id: true },
        });
        console.log('[API_PRODUCTS] User found:', !!user);

        if (user) {
          const subscriptions = await prisma.product_subscriptions.findMany({
            where: { user_id: user.id },
            select: { product_id: true },
          });
          console.log('[API_PRODUCTS] Subscriptions found:', subscriptions.length);
          subscribedIds = new Set(subscriptions.map(s => s.product_id));
        }
      } catch (e) {
        console.warn('[API_PRODUCTS] Could not fetch subscriptions for tg_id:', tgId, e);
      }
    }

    const result = products.map(p => {
      const productId = Number(p.id);
      // Приоритет: ActiveStorage изображение, затем image_url из таблицы
      const activeStorageUrl = imageMap.get(productId);
      const imageUrl = activeStorageUrl || p.image_url;
      
      console.log(`[API_PRODUCTS] Product ${productId} (${p.name}): ActiveStorage=${!!activeStorageUrl}, Final URL=${imageUrl?.substring(0, 50)}...`);
      
      return {
        id: productId,
        name: p.name,
        price: Number(p.price) || 0,
        old_price: p.old_price ? Number(p.old_price) : null,
        stock_quantity: p.stock_quantity,
        image_url: imageUrl,
        isSubscribed: subscribedIds.has(p.id),
      };
    });

    console.log('[API_PRODUCTS] Returning products:', result.length);
    
    // Применяем пользовательскую сортировку
    result.sort((a, b) => {
      // Функция для извлечения числа мг из названия
      const extractMg = (name: string | null): number => {
        if (!name) return 0;
        const match = name.match(/(\d+)\s*mg/i);
        return match ? parseInt(match[1]) : 0;
      };
      
      // Определяем приоритет брендов
      const getBrandPriority = (name: string | null): number => {
        if (!name) return 5;
        const nameLower = name.toLowerCase();
        if (nameLower.includes('atominex')) return 1;
        if (nameLower.includes('attex')) return 2;
        if (nameLower.includes('abilify')) return 3;
        if (nameLower.includes('arislow')) return 4;
        return 5; // Все остальные
      };
      
      const priorityA = getBrandPriority(a.name);
      const priorityB = getBrandPriority(b.name);
      
      // Если разные бренды - сортируем по приоритету
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Если одинаковый бренд - сортируем по мг
      // Для Atominex - от меньшего к большему (от 18 мг)
      if (priorityA === 1) { // Atominex
        const mgA = extractMg(a.name);
        const mgB = extractMg(b.name);
        
        // Если оба имеют мг, сортируем от меньшего к большему
        if (mgA > 0 && mgB > 0) {
          return mgA - mgB;
        }
        // Если только один имеет мг, он идет первым
        if (mgA > 0) return -1;
        if (mgB > 0) return 1;
      }
      
      // Для остальных брендов сохраняем исходный порядок
      return 0;
    });
    
    console.log('[API_PRODUCTS] Products after custom sorting:', result.map(p => `${p.name}`).join(', '));
    
    return NextResponse.json({ products: result });

  } catch (error) {
    console.error('[API_PRODUCTS_ERROR] Full error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
} 