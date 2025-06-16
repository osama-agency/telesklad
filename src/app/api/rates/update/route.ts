import { NextRequest, NextResponse } from 'next/server';
import { ExchangeRateService } from '@/lib/services/exchange-rate.service';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting automatic exchange rate update...');
    
    // Обновляем курс TRY из ЦБ РФ
    const result = await ExchangeRateService.updateTRYRate();
    
    if (result.success) {
      console.log(`✅ TRY rate updated successfully: ${result.rate}`);
      
      return NextResponse.json({
        success: true,
        message: 'Exchange rates updated successfully',
        data: {
          TRY: result.rate
        }
      });
    } else {
      console.error(`❌ Failed to update TRY rate: ${result.error}`);
      
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error updating exchange rates:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint для ручного обновления через браузер
export async function GET() {
  console.log('🔄 Manual exchange rate update requested...');
  return POST(new NextRequest('http://localhost/api/rates/update'));
} 