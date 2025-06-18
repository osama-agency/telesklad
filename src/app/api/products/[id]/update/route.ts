import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';

const prisma = new PrismaClient();

interface UpdateProductRequest {
  stock_quantity?: number;
  price?: number;
  old_price?: number;
  prime_cost?: number;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Product update request started for ID:', params.id);
    
    // TODO: Enable authentication after NEXTAUTH_SECRET is configured

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Неверный ID товара' }, { status: 400 });
    }

    const body: UpdateProductRequest = await request.json();
    console.log('🔧 Request body received:', body);
    
    const { stock_quantity, price, old_price, prime_cost } = body;

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

    if (prime_cost !== undefined && prime_cost < 0) {
      return NextResponse.json({ 
        error: 'Стоимость производства не может быть отрицательной' 
      }, { status: 400 });
    }

    // Проверяем существование товара
    console.log('🔧 Searching for product with ID:', productId);
    
    const existingProduct = await prisma.products.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      console.log('❌ Product not found for ID:', productId);
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }
    
    console.log('✅ Product found:', existingProduct.name);

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

    if (prime_cost !== undefined) {
      updateData.prime_cost = prime_cost;
    }

    // Если нет данных для обновления
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        error: 'Не указаны поля для обновления' 
      }, { status: 400 });
    }

    // Обновляем товар
    console.log('🔧 Executing database update with data:', updateData);
    
    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });
    
    console.log('✅ Product updated successfully');

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
    if (prime_cost !== undefined) {
      changes.push(`стоимость производства: ${existingProduct.prime_cost || 'не указана'} → ${prime_cost}₽`);
    }

    console.log(`📝 Товар #${productId} (${existingProduct.name}) обновлен: ${changes.join(', ')}`);

    return NextResponse.json({
      success: true,
      data: {
        id: Number(updatedProduct.id),
        name: updatedProduct.name,
        stock_quantity: updatedProduct.stock_quantity,
        price: updatedProduct.price,
        old_price: updatedProduct.old_price,
        prime_cost: updatedProduct.prime_cost,
        changes: changes
      },
      message: `Товар "${existingProduct.name}" успешно обновлен`
    });

  } catch (error) {
    console.error('❌ Unexpected error in product update endpoint:', error);
    
    // Максимально детальная информация об ошибке
    const errorInfo = {
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    };
    
    console.error('Error details:', errorInfo);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Неожиданная ошибка при обновлении товара',
        details: errorInfo.message,
        errorType: errorInfo.name,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  } finally {
    // Закрываем соединение с базой данных
    await prisma.$disconnect();
  }
} 