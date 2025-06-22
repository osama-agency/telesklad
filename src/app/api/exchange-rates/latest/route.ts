import { NextRequest, NextResponse } from 'next/server';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';

// GET - получение актуального курса валюты
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency');

    if (!currency) {
      return NextResponse.json(
        { error: 'Currency parameter is required' },
        { status: 400 }
      );
    }

    // Поддерживаем только TRY пока
    if (currency !== 'TRY') {
      return NextResponse.json(
        { error: `Currency ${currency} is not supported` },
        { status: 400 }
      );
    }

    console.log(`📈 Getting latest exchange rate for ${currency}...`);

    try {
      // Получаем актуальный курс из БД
      const rateData = await ExchangeRateService.getLatestRate(currency);
      
      const response = {
        currency,
        rate: Number(rateData.rate),
        rateWithBuffer: Number(rateData.rateWithBuffer),
        bufferPercent: Number(rateData.bufferPercent || 5),
        effectiveDate: rateData.effectiveDate,
        source: rateData.source || 'CBR',
        lastUpdated: rateData.effectiveDate
      };

      console.log(`✅ Found exchange rate for ${currency}:`, response);

      return NextResponse.json(response);
    } catch (dbError) {
      console.warn(`⚠️ No exchange rate found in DB for ${currency}, trying to update...`);
      
      // Если курса нет в БД, пробуем обновить из ЦБ РФ
      try {
        const updateResult = await ExchangeRateService.updateTRYRate();
        
        if (updateResult.success && updateResult.rate) {
          const response = {
            currency,
            rate: updateResult.rate,
            rateWithBuffer: updateResult.rate * 1.05, // 5% буфер по умолчанию
            bufferPercent: 5,
            effectiveDate: new Date().toISOString(),
            source: 'CBR',
            lastUpdated: new Date().toISOString(),
            freshlyUpdated: true
          };

          console.log(`✅ Updated and returning fresh exchange rate for ${currency}:`, response);
          return NextResponse.json(response);
        } else {
          throw new Error(updateResult.error || 'Failed to update exchange rate');
        }
      } catch (updateError) {
        console.error(`❌ Failed to update exchange rate for ${currency}:`, updateError);
        
        // Возвращаем fallback курс
        const fallbackRate = 30; // 1 лира ≈ 30 рублей
        const response = {
          currency,
          rate: fallbackRate,
          rateWithBuffer: fallbackRate * 1.05,
          bufferPercent: 5,
          effectiveDate: new Date().toISOString(),
          source: 'FALLBACK',
          lastUpdated: new Date().toISOString(),
          isFallback: true,
          warning: 'Using fallback exchange rate due to service unavailability'
        };

        console.log(`⚠️ Using fallback exchange rate for ${currency}:`, response);
        return NextResponse.json(response);
      }
    }
  } catch (error) {
    console.error('❌ Error in exchange rates API:', error);
    
    // В случае любой ошибки возвращаем fallback
    const fallbackRate = 30;
    return NextResponse.json({
      currency: 'TRY',
      rate: fallbackRate,
      rateWithBuffer: fallbackRate * 1.05,
      bufferPercent: 5,
      effectiveDate: new Date().toISOString(),
      source: 'FALLBACK',
      lastUpdated: new Date().toISOString(),
      isFallback: true,
      error: 'Service temporarily unavailable'
    });
  }
}

// POST - принудительное обновление курса
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'TRY';

    if (currency !== 'TRY') {
      return NextResponse.json(
        { error: `Currency ${currency} is not supported for updates` },
        { status: 400 }
      );
    }

    console.log(`🔄 Force updating exchange rate for ${currency}...`);

    const updateResult = await ExchangeRateService.updateTRYRate();
    
    if (updateResult.success) {
      const rateData = await ExchangeRateService.getLatestRate(currency);
      
      const response = {
        currency,
        rate: Number(rateData.rate),
        rateWithBuffer: Number(rateData.rateWithBuffer),
        bufferPercent: Number(rateData.bufferPercent || 5),
        effectiveDate: rateData.effectiveDate,
        source: rateData.source,
        lastUpdated: rateData.effectiveDate,
        updated: true
      };

      console.log(`✅ Successfully updated exchange rate for ${currency}:`, response);
      return NextResponse.json(response);
    } else {
      throw new Error(updateResult.error || 'Failed to update exchange rate');
    }
  } catch (error) {
    console.error('❌ Error updating exchange rate:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update exchange rate', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}