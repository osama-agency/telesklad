import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';
import { S3Service } from '@/lib/services/s3';

// POST /api/webapp/cart - получить данные корзины с изображениями
export async function POST(request: NextRequest) {
  try {
    const { cart_items } = await request.json();

    if (!cart_items || !Array.isArray(cart_items)) {
      return NextResponse.json(
        { success: false, error: 'Некорректные данные корзины' },
        { status: 400 }
      );
    }

    // Получаем ID продуктов из корзины
    const productIds = cart_items.map((item: any) => item.product_id);

    if (productIds.length === 0) {
      return NextResponse.json({
        success: true,
        cart_items: []
      });
    }

    // Получаем информацию о продуктах
    const products = await prisma.products.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true,
        price: true
      }
    });

    // Получаем изображения для продуктов
    const attachments = await prisma.active_storage_attachments.findMany({
      where: {
        record_type: 'Product',
        record_id: {
          in: productIds
        },
        name: 'image'
      },
      include: {
        active_storage_blobs: true
      }
    });

    // Создаем маппинг product_id -> blob_key
    const imageMapping: { [key: number]: string } = {};
    attachments.forEach(attachment => {
      if (attachment.active_storage_blobs?.key) {
        imageMapping[Number(attachment.record_id)] = attachment.active_storage_blobs.key;
      }
    });

    // Создаем маппинг product_id -> product info
    const productMapping: { [key: number]: any } = {};
    products.forEach(product => {
      productMapping[Number(product.id)] = product;
    });

    // Обогащаем данные корзины
    const enrichedCartItems = cart_items.map((cartItem: any) => {
      const product = productMapping[cartItem.product_id];
      const blobKey = imageMapping[cartItem.product_id];

      return {
        id: cartItem.id || cartItem.product_id,
        product_id: cartItem.product_id,
        product_name: product?.name || cartItem.product_name,
        product_price: product?.price ? Number(product.price) : cartItem.product_price,
        quantity: cartItem.quantity,
        image_url: blobKey ? S3Service.getImageUrl(blobKey) : undefined
      };
    });

    return NextResponse.json({
      success: true,
      cart_items: enrichedCartItems
    });

  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки корзины' },
      { status: 500 }
    );
  }
} 