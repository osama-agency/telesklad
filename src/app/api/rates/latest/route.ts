import { NextRequest, NextResponse } from 'next/server';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const currency = searchParams.get('currency');

    if (!currency) {
      return NextResponse.json(
        { error: 'Currency parameter is required' },
        { status: 400 }
      );
    }

    let rate;
    try {
      rate = await ExchangeRateService.getLatestRate(currency.toUpperCase());
    } catch (error) {
      // Если курс не найден, попробуем обновить его автоматически
      if (currency.toUpperCase() === 'TRY') {
        console.log('TRY rate not found, fetching from CBR...');
        const updateResult = await ExchangeRateService.updateTRYRate();
        if (updateResult.success) {
          rate = await ExchangeRateService.getLatestRate('TRY');
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        currency: rate.currency,
        rate: Number(rate.rate),
        rateWithBuffer: Number(rate.rateWithBuffer),
        bufferPercent: Number(rate.bufferPercent),
        effectiveDate: rate.effectiveDate,
        source: rate.source,
      },
    });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    if (error instanceof Error && error.message.includes('No exchange rate found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch exchange rate' },
      { status: 500 }
    );
  }
} 