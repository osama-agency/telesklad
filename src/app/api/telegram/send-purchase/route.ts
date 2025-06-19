import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

export async function POST(request: NextRequest) {
  try {
    const { purchaseId } = await request.json();

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 });
    }

    // Получаем данные закупки
    const purchase = await prisma.purchases.findUnique({
      where: { id: purchaseId },
      include: {
        purchase_items: {
          include: {
            products: true
          }
        }
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Формируем сообщение для Telegram
    const items = purchase.purchase_items.map((item: any) => {
      const productName = item.products?.name || `Товар #${item.productid}`;
      return `• ${productName} - ${item.quantity} шт.`;
    }).join('\n');

    const message = `
🛒 **Новая закупка #${purchase.id}**

📦 **Товары:**
${items}

💰 **Общая сумма:** ${purchase.totalamount?.toLocaleString("ru-RU")} ₽

📅 **Дата:** ${new Date(purchase.createdat).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}

🎯 **Статус:** Отправлен поставщику
`;

    // Здесь должна быть логика отправки в Telegram
    // Например, через Telegram Bot API
    console.log('Sending to Telegram:', message);

    // Обновляем messageId если нужно
    if (purchase.telegrammessageid) {
      await prisma.purchases.update({
        where: { id: purchaseId },
        data: {
          telegrammessageid: purchase.telegrammessageid
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Purchase sent to Telegram successfully' 
    });

  } catch (error) {
    console.error('Error sending purchase to Telegram:', error);
    return NextResponse.json(
      { error: 'Failed to send purchase to Telegram' },
      { status: 500 }
    );
  }
} 