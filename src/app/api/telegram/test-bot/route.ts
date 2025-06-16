import { NextRequest, NextResponse } from 'next/server';
import { TelegramBotService } from '@/lib/services/telegram-bot.service';

export async function GET() {
  console.log('🧪 Testing Telegram bot connection...');

  try {
    const botInfo = await TelegramBotService.getBotInfo();
    
    if (botInfo.error) {
      return NextResponse.json({
        success: false,
        error: botInfo.error
      });
    }

    console.log('✅ Bot connection test successful');
    
    return NextResponse.json({
      success: true,
      botInfo: {
        id: botInfo.result.id,
        is_bot: botInfo.result.is_bot,
        first_name: botInfo.result.first_name,
        username: botInfo.result.username,
        can_join_groups: botInfo.result.can_join_groups,
        can_read_all_group_messages: botInfo.result.can_read_all_group_messages,
        supports_inline_queries: botInfo.result.supports_inline_queries
      }
    });

  } catch (error: any) {
    console.error('❌ Bot connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 