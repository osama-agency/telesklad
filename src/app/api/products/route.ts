import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

const STRATTERA_API_URL = 'https://strattera.tgapp.online/api/v1/products';
const STRATTERA_TOKEN = '8cM9wVBrY3p56k4L1VBpIBwOsw';

// Функция синхронизации товаров из внешнего API в локальную базу
async function syncProductsFromAPI() {
  try {
    // Запрос к внешнему API Strattera
    const response = await fetch(STRATTERA_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': STRATTERA_TOKEN, // Без "Bearer" префикса
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Strattera API error: ${response.status}`);
    }

    const externalProducts = await response.json();

    // Обновляем товары в локальной базе
    for (const extProduct of externalProducts) {
      await prisma.product.upsert({
        where: { id: extProduct.id },
        update: {
          name: extProduct.name,
          description: extProduct.description,
          price: extProduct.price ? parseFloat(extProduct.price) : null,
          stock_quantity: extProduct.stock_quantity,
          updated_at: new Date(),
          deleted_at: extProduct.deleted_at ? new Date(extProduct.deleted_at) : null,
          ancestry: extProduct.ancestry,
          weight: extProduct.weight,
          dosage_form: extProduct.dosage_form,
          package_quantity: extProduct.package_quantity,
          main_ingredient: extProduct.main_ingredient,
          brand: extProduct.brand,
          old_price: extProduct.old_price ? parseFloat(extProduct.old_price) : null,
        },
        create: {
          id: extProduct.id,
          name: extProduct.name,
          description: extProduct.description,
          price: extProduct.price ? parseFloat(extProduct.price) : null,
          stock_quantity: extProduct.stock_quantity,
          created_at: extProduct.created_at ? new Date(extProduct.created_at) : new Date(),
          updated_at: extProduct.updated_at ? new Date(extProduct.updated_at) : new Date(),
          deleted_at: extProduct.deleted_at ? new Date(extProduct.deleted_at) : null,
          ancestry: extProduct.ancestry,
          weight: extProduct.weight,
          dosage_form: extProduct.dosage_form,
          package_quantity: extProduct.package_quantity,
          main_ingredient: extProduct.main_ingredient,
          brand: extProduct.brand,
          old_price: extProduct.old_price ? parseFloat(extProduct.old_price) : null,
          is_visible: true, // По умолчанию товары видимы
        },
      });
    }

    return externalProducts.length;
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
}

// GET - получение товаров из локальной базы с синхронизацией и фильтрацией по датам
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Синхронизируем товары из внешнего API
    await syncProductsFromAPI();

    // Строим условия фильтрации
    const whereConditions: any = {
      is_visible: true,
      deleted_at: null,
    };
    
    if (from || to) {
      whereConditions.created_at = {};
      if (from) {
        whereConditions.created_at.gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // Включаем весь день
        whereConditions.created_at.lte = toDate;
      }
    }

    // Возвращаем товары из локальной базы с фильтрацией
    const products = await prisma.product.findMany({
      where: whereConditions,
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// POST - создание/обновление товара в локальной базе
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productData = await request.json();

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price ? parseFloat(productData.price) : null,
        stock_quantity: productData.stock_quantity,
        ancestry: productData.ancestry,
        weight: productData.weight,
        dosage_form: productData.dosage_form,
        package_quantity: productData.package_quantity,
        main_ingredient: productData.main_ingredient,
        brand: productData.brand,
        old_price: productData.old_price ? parseFloat(productData.old_price) : null,
        is_visible: productData.is_visible !== undefined ? productData.is_visible : true,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 