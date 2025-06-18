import { NextRequest, NextResponse } from 'next/server';
import InventoryTransitService from '@/lib/services/inventory-transit.service';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Transit inventory API called');

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      // Получить детали для конкретного товара
      const details = await InventoryTransitService.getProductTransitDetails(parseInt(productId));
      
      if (!details) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: details
      });
    } else {
      // Получить сводку по всем товарам в транзите
      const summary = await InventoryTransitService.getTransitSummary();
      
      return NextResponse.json({
        success: true,
        data: summary,
        total: summary.length
      });
    }
  } catch (error) {
    console.error('❌ Error in transit inventory API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transit inventory',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Transit inventory sync API called');

    const body = await request.json();
    const { action } = body;

    if (action === 'sync') {
      await InventoryTransitService.syncTransitQuantities();
      
      return NextResponse.json({
        success: true,
        message: 'Transit quantities synchronized successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Error in transit inventory sync API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync transit inventory',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 