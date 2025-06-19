import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    console.log('API called with category_id:', categoryId);

    // Get category_id from params OR default_product_id from settings (like in Rails)
    let productId: number | null = null;
    
    if (categoryId) {
      productId = parseInt(categoryId);
      console.log('Using provided category_id:', productId);
    } else {
      // Get default_product_id from settings like in Rails
      const defaultSetting = await prisma.settings.findUnique({
        where: { variable: 'default_product_id' }
      });
      
      if (defaultSetting?.value) {
        productId = parseInt(defaultSetting.value);
        console.log('Using default_product_id from settings:', productId);
      }
    }

    if (!productId) {
      console.log('No valid product_id found');
      return NextResponse.json([]);
    }

    // Find the parent category (like Rails logic)
    const parent = await prisma.products.findUnique({
      where: { 
        id: productId,
        deleted_at: null 
      }
    });

    if (!parent) {
      console.log('Parent category not found for id:', productId);
      return NextResponse.json([]);
    }

    console.log('Found parent category:', parent.name, 'ancestry:', parent.ancestry);

    // Get children of this parent (like Rails: parent.children.available)
    const expectedAncestry = parent.ancestry ? `${parent.ancestry}/${productId}` : `${productId}`;
    console.log('Looking for children with ancestry:', expectedAncestry);

    const products = await prisma.products.findMany({
      where: {
        ancestry: expectedAncestry,
        deleted_at: null, // available products
      },
      select: {
        id: true,
        name: true,
        price: true,
        old_price: true,
        stock_quantity: true,
        ancestry: true,
      },
      // Rails sorts by: stock_quantity: :desc, created_at: :desc
      orderBy: [
        { stock_quantity: 'desc' },
        { created_at: 'desc' }
      ]
    });

    console.log('Found products count:', products.length);

    // Transform the data to match the expected format
    const transformedProducts = products.map((product: any) => ({
      id: Number(product.id), // Convert BigInt to Number
      name: product.name,
      price: Number(product.price || 0),
      old_price: product.old_price ? Number(product.old_price) : undefined,
      stock_quantity: Number(product.stock_quantity),
      image_url: undefined, // TODO: Implement image URL generation
    }));

    console.log('Returning products:', transformedProducts.length);
    return NextResponse.json(transformedProducts);

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 