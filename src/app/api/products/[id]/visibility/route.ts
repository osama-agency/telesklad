import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

// PATCH - обновление видимости товара
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { is_visible } = await request.json();

    if (typeof is_visible !== 'boolean') {
      return NextResponse.json({ error: 'is_visible must be a boolean' }, { status: 400 });
    }

    const resolvedParams = await params;
    const product = await prisma.products.update({
      where: { 
        id: parseInt(resolvedParams.id),
        deleted_at: null // Нельзя изменять видимость удаленных товаров
      },
      data: {
        is_visible,
        updated_at: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        is_visible: product.is_visible,
        updated_at: product.updated_at
      }
    });
  } catch (error: any) {
    console.error('Error updating product visibility:', error);
    
    // Если товар не найден
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 