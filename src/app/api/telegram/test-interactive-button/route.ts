import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing interactive button functionality');

    // Тестовые данные для закупки
    const testPurchaseData = {
      items: [
        { productName: 'Test Product 1', quantity: 10 },
        { productName: 'Test Product 2', quantity: 5 }
      ],
      totalAmount: 1500.00
    };

    // Отправляем тестовое уведомление с кнопкой
    const result = await TelegramBotService.sendPaymentNotification(999, testPurchaseData);

    if (result.success) {
      console.log('✅ Test interactive button sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Test interactive button sent',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test interactive button'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error testing interactive button:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test interactive button endpoint ready',
    instructions: 'Send POST request to test interactive buttons'
  });
} 