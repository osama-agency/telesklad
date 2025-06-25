import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { SettingsService } from '@/lib/services/SettingsService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем все настройки бота
    const settings = await SettingsService.getBotSettings();
    
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('❌ Error getting bot settings:', error);
    return NextResponse.json(
      { error: 'Ошибка получения настроек бота' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { section, data } = await request.json();
    
    if (!section || !data) {
      return NextResponse.json(
        { error: 'Неверный формат данных' },
        { status: 400 }
      );
    }

    let updateData: Record<string, string> = {};

    switch (section) {
      case 'tokens':
        updateData = {
          client_bot_token: data.client_bot_token || '',
          admin_bot_token: data.admin_bot_token || '',
        };
        break;
        
      case 'chats':
        updateData = {
          admin_chat_id: data.admin_chat_id || '',
          courier_tg_id: data.courier_tg_id || '',
        };
        break;
        
      case 'buttons':
        updateData = {
          bot_btn_title: data.bot_btn_title || '',
          group_btn_title: data.group_btn_title || '',
          support_btn_title: data.support_btn_title || '',
          tg_group: data.tg_group || '',
          tg_support: data.tg_support || '',
        };
        break;
        
      case 'media':
        updateData = {
          first_video_id: data.first_video_id || '',
        };
        break;
        
      case 'webhook':
        updateData = {
          webhook_url: data.webhook_url || '',
          webhook_secret: data.webhook_secret || '',
          webhook_max_connections: data.webhook_max_connections?.toString() || '40',
          grammy_enabled: data.grammy_enabled?.toString() || 'true',
        };
        break;
        
      default:
        return NextResponse.json(
          { error: 'Неизвестная секция' },
          { status: 400 }
        );
    }

    // Обновляем настройки
    const result = await SettingsService.bulkUpdate(updateData);
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Настройки успешно сохранены'
      });
    } else {
      return NextResponse.json(
        { error: 'Не удалось сохранить настройки' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error saving bot settings:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения настроек' },
      { status: 500 }
    );
  }
}