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

    // Фильтруем категории (где ancestry is null или не содержит /)
    const productsOnly = externalProducts.filter((p: any) => p.ancestry && p.ancestry.includes('/'));

    console.log(`Синхронизация: получено ${externalProducts.length} записей, из них ${productsOnly.length} являются товарами.`);

    // Обновляем товары в локальной базе
    for (const extProduct of productsOnly) {
              await (prisma as any).products.upsert({
        where: { id: extProduct.id },
        update: {
          name: extProduct.name,
          description: extProduct.description,
          price: extProduct.price ? Number(extProduct.price) : null,
          prime_cost: extProduct.prime_cost ? Number(extProduct.prime_cost) : null,
          stock_quantity: extProduct.stock_quantity,
          updated_at: new Date(),
          deleted_at: extProduct.deleted_at ? new Date(extProduct.deleted_at) : null,
          ancestry: extProduct.ancestry,
          weight: extProduct.weight,
          dosage_form: extProduct.dosage_form,
          package_quantity: extProduct.package_quantity,
          main_ingredient: extProduct.main_ingredient,
          brand: extProduct.brand,
          old_price: extProduct.old_price ? Number(extProduct.old_price) : null,
        },
        create: {
          id: extProduct.id,
          name: extProduct.name,
          description: extProduct.description,
          price: extProduct.price ? Number(extProduct.price) : null,
          prime_cost: extProduct.prime_cost ? Number(extProduct.prime_cost) : null,
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
          old_price: extProduct.old_price ? Number(extProduct.old_price) : null,
          is_visible: true, // По умолчанию товары видимы
        },
      });
    }

    return productsOnly.length;
  } catch (error) {
    console.error('Error syncing products:', error);
    throw error;
  }
}

// GET - получение товаров из локальной базы с синхронизацией
export async function GET(request: NextRequest) {
  try {
    console.log('🛍️ Products API: Starting request...');
    
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // 
    // if (!session?.user?.email) {
    //   console.log('❌ Products API: Unauthorized');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const showHidden = searchParams.get('showHidden') === 'true';
    
    console.log('🛍️ Products API: Params -', { showHidden });

    // Дефолтный курс лиры
    const exchangeRate = 2.02;
    console.log('💱 Exchange rate TRY:', exchangeRate);

    // Строим условия фильтрации
    const whereConditions: any = {
      deleted_at: null,
      ancestry: {
        contains: '/' // только настоящие товары, не категории
      }
    };

    // Фильтрация по видимости товаров
    if (showHidden) {
      whereConditions.is_visible = false;
    } else {
      whereConditions.is_visible = true;
    }

    // Получаем товары
    console.log('🛍️ Products API: Fetching products...');
    const products = await (prisma as any).products.findMany({
      where: whereConditions,
      orderBy: {
        name: 'asc'
      }
    });
    console.log('🛍️ Products API: Found', products.length, 'products');

    // Простая обработка товаров без агрегаций
    const productsWithCalculations = products.map((product: any) => {
      // Расчет средней себестоимости в лирах
      const avgPurchasePrice = product.avgpurchasepricerub ? Number(product.avgpurchasepricerub.toString()) : 0;
      const primePrice = product.prime_cost ? Number(product.prime_cost.toString()) : 0;
      
      let avgPurchasePriceTry = 0;
      if (avgPurchasePrice > 0) {
        // avgPurchasePrice в рублях, конвертируем в лиры
        avgPurchasePriceTry = avgPurchasePrice / exchangeRate;
      } else if (primePrice > 0) {
        // prime_cost уже в лирах, используем как есть
        avgPurchasePriceTry = primePrice;
      }

      return {
        ...product,
        // Преобразуем BigInt в строку для JSON сериализации
        id: product.id.toString(),
        // Конвертируем Decimal поля в числа
        price: product.price ? Number(product.price.toString()) : null,
        prime_cost: primePrice,
        avgpurchasepricerub: avgPurchasePrice,
        avgPurchasePriceTry,
        inTransitQuantity: 0, // Пока без агрегаций
        old_price: product.old_price ? Number(product.old_price.toString()) : null,
        show_in_webapp: product.show_in_webapp || false,
      };
    });

    console.log('🛍️ Products API: Successfully processed', productsWithCalculations.length, 'products');
    return NextResponse.json({
      success: true,
      data: {
        products: productsWithCalculations,
        total: productsWithCalculations.length
      }
    });
  } catch (error) {
    console.error('❌ Products API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

// POST - создание/обновление товара в локальной базе
export async function POST(request: NextRequest) {
  let productData: any = {};
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // 
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    productData = await request.json();

    const product = await (prisma as any).products.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price ? Number(productData.price) : null,
        prime_cost: productData.prime_cost ? Number(productData.prime_cost) : null,
        stock_quantity: productData.stock_quantity || 0,
        ancestry: productData.ancestry,
        weight: productData.weight,
        dosage_form: productData.dosage_form,
        package_quantity: productData.package_quantity,
        main_ingredient: productData.main_ingredient,
        brand: productData.brand,
        old_price: productData.old_price ? Number(productData.old_price) : null,
        is_visible: productData.is_visible !== undefined ? productData.is_visible : true,
        show_in_webapp: productData.show_in_webapp !== undefined ? productData.show_in_webapp : true,
        image_url: productData.image_url,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    // Преобразуем BigInt в строку для JSON сериализации
    const serializedProduct = {
      ...product,
      id: product.id.toString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: serializedProduct
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Product data:', productData);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// PUT - обновление товара
export async function PUT(request: NextRequest) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // 
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const productData = await request.json();
    
    if (!productData.id) {
      return NextResponse.json(
        { error: 'Product ID is required' }, 
        { status: 400 }
      );
    }

    const product = await (prisma as any).products.update({
      where: { id: parseInt(productData.id) },
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price ? Number(productData.price) : null,
        prime_cost: productData.prime_cost ? Number(productData.prime_cost) : null,
        stock_quantity: productData.stock_quantity,
        quantity_in_transit: productData.quantity_in_transit || 0,
        ancestry: productData.ancestry,
        weight: productData.weight,
        dosage_form: productData.dosage_form,
        package_quantity: productData.package_quantity,
        main_ingredient: productData.main_ingredient,
        brand: productData.brand,
        old_price: productData.old_price ? Number(productData.old_price) : null,
        is_visible: productData.is_visible !== undefined ? productData.is_visible : true,
        show_in_webapp: productData.show_in_webapp !== undefined ? productData.show_in_webapp : true,
        image_url: productData.image_url,
        updated_at: new Date(),
      }
    });

    // Преобразуем BigInt в строку для JSON сериализации
    const serializedProduct = {
      ...product,
      id: product.id.toString(),
      price: product.price ? Number(product.price.toString()) : null,
      prime_cost: product.prime_cost ? Number(product.prime_cost.toString()) : null,
      old_price: product.old_price ? Number(product.old_price.toString()) : null,
    };

    return NextResponse.json(serializedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
} 