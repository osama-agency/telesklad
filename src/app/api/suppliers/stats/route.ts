import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SupplierStatsService } from '@/lib/services/SupplierStatsService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const stats = await SupplierStatsService.getAllSuppliersStats();

    return NextResponse.json({
      success: true,
      data: stats,
      message: `Загружена статистика ${stats.length} поставщиков`,
    });

  } catch (error) {
    console.error('Ошибка получения статистики поставщиков:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении статистики поставщиков',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }, 
      { status: 500 }
    );
  }
}

// GET /api/suppliers/stats/:supplier - получить статистику конкретного поставщика
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { supplier } = await request.json();

    if (!supplier) {
      return NextResponse.json({ error: 'Необходимо указать название поставщика' }, { status: 400 });
    }

    const avgDeliveryDays = await SupplierStatsService.getAvgDeliveryDays(supplier);

    return NextResponse.json({
      success: true,
      data: {
        supplier,
        avgDeliveryDays,
      },
      message: `Среднее время доставки для ${supplier}: ${avgDeliveryDays} дней`,
    });

  } catch (error) {
    console.error('Ошибка получения статистики поставщика:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении статистики поставщика',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }, 
      { status: 500 }
    );
  }
} 