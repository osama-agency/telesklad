import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { updateExchangeRatesManually } from '@/lib/cron/exchange-rate-cron';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Проверяем авторизацию и права администратора
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Запускаем обновление курсов
    const result = await updateExchangeRatesManually();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Exchange rates updated successfully',
        data: {
          currency: 'TRY',
          rate: result.rate,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to update exchange rates',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 