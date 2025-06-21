import { NextRequest, NextResponse } from 'next/server';
import { TelegramTokenService } from '@/lib/services/telegram-token.service';

// GET - получение статуса токенов ботов
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Getting tokens status...');
    
    const status = await TelegramTokenService.getTokensStatus();
    
    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting tokens status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get tokens status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - обновление токена
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenType, token } = body;

    if (!tokenType || !token) {
      return NextResponse.json(
        { error: 'tokenType and token are required' },
        { status: 400 }
      );
    }

    if (!['telegram_bot_token', 'webapp_telegram_bot_token'].includes(tokenType)) {
      return NextResponse.json(
        { error: 'Invalid tokenType. Must be telegram_bot_token or webapp_telegram_bot_token' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating ${tokenType}...`);
    
    const success = await TelegramTokenService.updateToken(tokenType, token);
    
    if (success) {
      // Очищаем кэш для обновления статуса
      TelegramTokenService.clearCache();
      
      return NextResponse.json({
        success: true,
        message: `${tokenType} updated successfully`
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to update ${tokenType}. Token validation failed.`
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Error updating token:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - очистка кэша токенов
export async function DELETE(request: NextRequest) {
  try {
    TelegramTokenService.clearCache();
    
    return NextResponse.json({
      success: true,
      message: 'Token cache cleared successfully'
    });

  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 