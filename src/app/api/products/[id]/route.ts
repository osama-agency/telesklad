import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

// GET - получение товара по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.products.findUnique({
      where: { 
        id: parseInt(id),
        deleted_at: null 
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - обновление товара
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const productData = await request.json();

    const product = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price ? parseFloat(productData.price) : null,
        prime_cost: productData.prime_cost ? parseFloat(productData.prime_cost) : null,
        stock_quantity: productData.stock_quantity,
        ancestry: productData.ancestry,
        weight: productData.weight,
        dosage_form: productData.dosage_form,
        package_quantity: productData.package_quantity,
        main_ingredient: productData.main_ingredient,
        brand: productData.brand,
        old_price: productData.old_price ? parseFloat(productData.old_price) : null,
        is_visible: productData.is_visible,
        updated_at: new Date(),
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - мягкое удаление товара (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.products.update({
      where: { id: parseInt(id) },
      data: {
        deleted_at: new Date(),
        is_visible: false,
        updated_at: new Date(),
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 