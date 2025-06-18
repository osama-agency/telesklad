import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 Payment button click API called');
    
    const { id } = await params;
    const purchaseId = parseInt(id);
    
    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { error: 'Invalid purchase ID' },
        { status: 400 }
      );
    }

    console.log(`💰 Processing payment button click for purchase #${purchaseId}`);

    // Получаем текущую закупку
    const purchase = await (prisma as any).purchases.findUnique({
      where: { id: purchaseId }
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    const currentClicks = purchase.paymentbuttonclicks || 0;
    
    // Проверяем лимит
    if (currentClicks >= 3) {
      console.log(`⚠️ Payment button click limit reached for purchase #${purchaseId}`);
      return NextResponse.json({
        clickCount: currentClicks,
        limitReached: true
      });
    }

    // Увеличиваем счетчик нажатий
    const newClickCount = currentClicks + 1;
    
    await (prisma as any).purchases.update({
      where: { id: purchaseId },
      data: {
        paymentbuttonclicks: newClickCount,
        updatedat: new Date()
      }
    });

    console.log(`✅ Payment button click count updated to ${newClickCount} for purchase #${purchaseId}`);

    return NextResponse.json({
      clickCount: newClickCount,
      limitReached: newClickCount >= 3
    });

  } catch (error) {
    console.error('❌ Error processing payment button click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 