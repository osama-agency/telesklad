import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

interface UpdateProductRequest {
  stock_quantity?: number;
  price?: number;
  old_price?: number;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Неверный ID товара' }, { status: 400 });
    }

    const body: UpdateProductRequest = await request.json();
    const { stock_quantity, price, old_price } = body;

    // Валидация данных
    if (stock_quantity !== undefined && (stock_quantity < 0 || !Number.isInteger(stock_quantity))) {
      return NextResponse.json({ 
        error: 'Остаток товара должен быть неотрицательным целым числом' 
      }, { status: 400 });
    }

    if (price !== undefined && price < 0) {
      return NextResponse.json({ 
        error: 'Цена товара не может быть отрицательной' 
      }, { status: 400 });
    }

    if (old_price !== undefined && old_price < 0) {
      return NextResponse.json({ 
        error: 'Старая цена не может быть отрицательной' 
      }, { status: 400 });
    }

    // Проверяем существование товара
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Подготавливаем объект для обновления
    const updateData: any = {};
    
    if (stock_quantity !== undefined) {
      updateData.stock_quantity = stock_quantity;
    }
    
    if (price !== undefined) {
      updateData.price = price;
    }
    
    if (old_price !== undefined) {
      updateData.old_price = old_price;
    }

    // Если нет данных для обновления
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'Не указаны поля для обновления' 
      }, { status: 400 });
    }

    // Обновляем товар
    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    // Формируем ответ
    const changes = [];
    if (stock_quantity !== undefined) {
      changes.push(`остаток: ${existingProduct.stock_quantity} → ${stock_quantity}`);
    }
    if (price !== undefined) {
      changes.push(`цена: ${existingProduct.price} → ${price}₽`);
    }
    if (old_price !== undefined) {
      changes.push(`старая цена: ${existingProduct.old_price || 'не указана'} → ${old_price}₽`);
    }

    console.log(`📝 Товар #${productId} (${existingProduct.name}) обновлен: ${changes.join(', ')}`);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        stock_quantity: updatedProduct.stock_quantity,
        price: updatedProduct.price,
        old_price: updatedProduct.old_price,
        changes: changes
      },
      message: `Товар "${existingProduct.name}" успешно обновлен`
    });

  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при обновлении товара',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }, 
      { status: 500 }
    );
  }
} 