import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body: CreatePurchaseRequest = await request.json();
    const { items, totalTRY, totalRUB, supplierName, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 });
    }

    // Находим пользователя в таблице users по email из сессии
    const user = await prisma.users.findFirst({
      where: {
        email: session.user.email!,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Создаем закупку в транзакции
    const purchase = await prisma.$transaction(async (tx) => {
      // Создаем основную запись закупки
      const newPurchase = await tx.purchases.create({
        data: {
          suppliername: supplierName,
          totalamount: totalRUB,
          status: 'draft',
          notes: notes || '',
          userid: user.id, // используем BigInt ID из таблицы users
        },
      });

      // Создаем позиции закупки
      const purchaseItems = await Promise.all(
        items.map(item => 
          tx.purchase_items.create({
            data: {
              purchaseid: newPurchase.id,
              productid: BigInt(item.id),
              quantity: item.quantity,
              unitcostrub: item.costPrice,
              unitcosttry: item.costPriceTRY,
              totalcostrub: item.costPrice * item.quantity,
              totalcosttry: item.costPriceTRY * item.quantity,
              productname: item.name,
              // используем старые поля для совместимости
              costprice: item.costPrice,
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

    // Уведомление в Telegram отправляется только при смене статуса на "sent_to_supplier"
    console.log(`✅ Закупка #${purchase.id} создана в статусе "draft". Уведомление в Telegram будет отправлено при смене статуса на "Отправлено".`);

    return NextResponse.json({
      success: true,
      data: {
        id: purchase.id,
        supplier: supplierName, // используем из запроса
        totalCost: totalRUB,
        totalCostTRY: totalTRY,
        status: purchase.status,
        itemsCount: items.length,
        createdAt: purchase.createdat,
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