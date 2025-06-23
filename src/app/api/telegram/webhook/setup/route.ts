import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { TelegramBotWorker } from '@/lib/services/telegram-bot-worker.service';

const botWorker = TelegramBotWorker.getInstance();

export const dynamic = 'force-dynamic';

/**
 * GET - получение информации о текущем webhook
 */
export async function GET() {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем информацию о webhook
    const webhookInfo = await botWorker.getWebhookInfo();
    
    return NextResponse.json({
      success: true,
      webhook: webhookInfo
    });
    
  } catch (error) {
    console.error('Error getting webhook info:', error);
    return NextResponse.json(
      { error: 'Failed to get webhook info' },
      { status: 500 }
    );
  }
}

/**
 * POST - установка webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, secretToken } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'Webhook URL is required' },
        { status: 400 }
      );
    }

    // Устанавливаем webhook
    const result = await botWorker.setupWebhook(url, secretToken);
    
    if (result) {
      // Получаем обновленную информацию
      const webhookInfo = await botWorker.getWebhookInfo();
      
      return NextResponse.json({
        success: true,
        message: 'Webhook set successfully',
        webhook: webhookInfo
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to set webhook' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error setting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to set webhook' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - удаление webhook
 */
export async function DELETE() {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Удаляем webhook
    const result = await botWorker.deleteWebhook();
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Webhook deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete webhook' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}