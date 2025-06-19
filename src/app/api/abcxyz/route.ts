import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Получаем параметры периода
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    
    // По умолчанию - последние 30 дней
    const defaultTo = new Date();
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    
    let from = fromParam ? new Date(fromParam) : defaultFrom;
    let to = toParam ? new Date(toParam) : defaultTo;
    
    // Если это один и тот же день (разница меньше суток), расширяем на весь день
    if (fromParam && toParam && Math.abs(to.getTime() - from.getTime()) < 24 * 60 * 60 * 1000) {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
    }

    // Проверяем валидность дат
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return NextResponse.json(
        { error: 'Некорректные даты' },
        { status: 400 }
      );
    }

    if (from > to) {
      return NextResponse.json(
        { error: 'Дата начала не может быть больше даты окончания' },
        { status: 400 }
      );
    }

    // Получаем анализ
    let analysis;
    try {
      analysis = await AnalyticsService.getAbcXyz(from, to);
    } catch (serviceError) {
      console.error('AnalyticsService error:', serviceError);
      // Возвращаем пустые данные вместо ошибки
      analysis = {
        products: [],
        matrix: {
          AX: 0, AY: 0, AZ: 0,
          BX: 0, BY: 0, BZ: 0,
          CX: 0, CY: 0, CZ: 0
        },
        matrixWithProducts: {
          AX: { count: 0, products: [] },
          AY: { count: 0, products: [] },
          AZ: { count: 0, products: [] },
          BX: { count: 0, products: [] },
          BY: { count: 0, products: [] },
          BZ: { count: 0, products: [] },
          CX: { count: 0, products: [] },
          CY: { count: 0, products: [] },
          CZ: { count: 0, products: [] }
        }
      };
    }
    
    return NextResponse.json({
      success: true,
      data: analysis,
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error in ABC/XYZ API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка при выполнении ABC/XYZ анализа',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 