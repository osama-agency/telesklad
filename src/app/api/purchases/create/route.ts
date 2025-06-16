import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

interface CartItem {
  id: number;
  name: string;
  brand: string;
  quantity: number;
  costPrice: number; // себестоимость в рублях
  costPriceTRY: number; // себестоимость в лирах
}

interface CreatePurchaseRequest {
  items: CartItem[];
  totalTRY: number;
  totalRUB: number;
  supplierName: string;
  notes?: string;
  // exchangeRate больше не передается при создании, только при оплате
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body: CreatePurchaseRequest = await request.json();
    const { items, totalTRY, totalRUB, supplierName, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 });
    }

    // Создаем закупку в транзакции
    const purchase = await prisma.$transaction(async (tx) => {
      // Создаем основную запись закупки (временно используем старые поля)
      const newPurchase = await tx.purchase.create({
        data: {
          // supplier: supplierName, // будет добавлено после миграции
          // totalCost: totalRUB, // будет добавлено после миграции
          // totalCostTRY: totalTRY, // будет добавлено после миграции
          // exchangeRate НЕ сохраняется при создании
          status: 'draft',
          // notes: notes || '', // будет добавлено после миграции
          userId: session.user.id!,
          totalAmount: totalRUB, // используем старое поле
        },
      });

      // Создаем позиции закупки (временно используем старые поля)
      const purchaseItems = await Promise.all(
        items.map(item => 
          tx.purchaseItem.create({
            data: {
              purchaseId: newPurchase.id,
              productId: item.id,
              quantity: item.quantity,
              // unitCostRub: item.costPrice, // будет добавлено после миграции
              // unitCostTry: item.costPriceTRY, // будет добавлено после миграции
              // totalCostRub: item.costPrice * item.quantity, // будет добавлено после миграции
              // totalCostTry: item.costPriceTRY * item.quantity, // будет добавлено после миграции
              productName: item.name,
              // используем старые поля для совместимости
              costPrice: item.costPrice,
              total: item.costPrice * item.quantity,
            },
          })
        )
      );

      return {
        ...newPurchase,
        items: purchaseItems,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: purchase.id,
        supplier: supplierName, // используем из запроса
        totalCost: totalRUB,
        totalCostTRY: totalTRY,
        status: purchase.status,
        itemsCount: items.length,
        createdAt: purchase.createdAt,
      },
      message: `Закупка #${purchase.id} успешно создана`,
    });

  } catch (error) {
    console.error('Ошибка создания закупки:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при создании закупки',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }, 
      { status: 500 }
    );
  }
} 