import { NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

export async function GET() {
  try {
    console.log('Testing DB connection...');
    
    // Простой запрос для проверки соединения
    const count = await prisma.products.count();
    console.log('Products count:', count);
    
    // Получаем первый товар
    const firstProduct = await prisma.products.findFirst();
    console.log('First product:', firstProduct);
    
    return NextResponse.json({ 
      success: true, 
      count,
      firstProduct: firstProduct ? {
        id: Number(firstProduct.id),
        name: firstProduct.name
      } : null
    });
  } catch (error) {
    console.error('DB Test Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 