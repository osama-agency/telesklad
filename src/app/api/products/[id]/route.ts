import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

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

    // Сериализуем BigInt поля
    const serializedProduct = {
      ...product,
      id: Number(product.id),
      price: product.price ? Number(product.price) : null,
      prime_cost: product.prime_cost ? Number(product.prime_cost) : null,
      old_price: product.old_price ? Number(product.old_price) : null,
      stock_quantity: Number(product.stock_quantity),
      package_quantity: product.package_quantity ? Number(product.package_quantity) : null,
      quantity_in_transit: product.quantity_in_transit ? Number(product.quantity_in_transit) : null,
      avgpurchasepricerub: product.avgpurchasepricerub ? Number(product.avgpurchasepricerub) : null,
      avgpurchasepricetry: product.avgpurchasepricetry ? Number(product.avgpurchasepricetry) : null,
      created_at: product.created_at?.toISOString(),
      updated_at: product.updated_at?.toISOString(),
      deleted_at: product.deleted_at?.toISOString() || null,
    };

    return NextResponse.json(serializedProduct);
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

    // Сериализуем BigInt поля
    const serializedProduct = {
      ...product,
      id: Number(product.id),
      price: product.price ? Number(product.price) : null,
      prime_cost: product.prime_cost ? Number(product.prime_cost) : null,
      old_price: product.old_price ? Number(product.old_price) : null,
      stock_quantity: Number(product.stock_quantity),
      package_quantity: product.package_quantity ? Number(product.package_quantity) : null,
      quantity_in_transit: product.quantity_in_transit ? Number(product.quantity_in_transit) : null,
      avgpurchasepricerub: product.avgpurchasepricerub ? Number(product.avgpurchasepricerub) : null,
      avgpurchasepricetry: product.avgpurchasepricetry ? Number(product.avgpurchasepricetry) : null,
      created_at: product.created_at?.toISOString(),
      updated_at: product.updated_at?.toISOString(),
      deleted_at: product.deleted_at?.toISOString() || null,
    };

    return NextResponse.json(serializedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Удаление товара
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Некорректный ID товара' },
        { status: 400 }
      );
    }

    // Проверяем существование товара
    const existingProduct = await prismaClient.products.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Удаляем связанные записи изображений
    await prismaClient.active_storage_attachments.deleteMany({
      where: {
        record_type: 'Product',
        record_id: productId,
        name: 'image'
      }
    });

    // Удаляем товар
    await prismaClient.products.delete({
      where: { id: productId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Товар успешно удален' 
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении товара' },
      { status: 500 }
    );
  }
} 