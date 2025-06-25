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

    const settings = await SettingsService.getBotSettings();
    
    // Проверяем статус ботов
    const botStatuses = await Promise.allSettled([
      checkBotStatus(settings.client_bot_token, 'client'),
      checkBotStatus(settings.admin_bot_token, 'admin')
    ]);

    const clientStatus = botStatuses[0].status === 'fulfilled' ? botStatuses[0].value : { status: 'error', error: 'Ошибка подключения' };
    const adminStatus = botStatuses[1].status === 'fulfilled' ? botStatuses[1].value : { status: 'error', error: 'Ошибка подключения' };

    return NextResponse.json({
      success: true,
      bots: {
        client: clientStatus,
        admin: adminStatus
      }
    });
  } catch (error) {
    console.error('❌ Error checking bot status:', error);
    return NextResponse.json(
      { error: 'Ошибка проверки статуса ботов' },
      { status: 500 }
    );
  }
}

async function checkBotStatus(token: string, type: string) {
  if (!token) {
    return {
      status: 'error',
      error: 'Токен не настроен',
      bot: null
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 секунд таймаут
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.ok) {
        return {
          status: 'active',
          bot: {
            id: data.result.id,
            first_name: data.result.first_name,
            username: data.result.username,
            can_join_groups: data.result.can_join_groups,
            can_read_all_group_messages: data.result.can_read_all_group_messages,
            supports_inline_queries: data.result.supports_inline_queries
          }
        };
      } else {
        return {
          status: 'error',
          error: data.description || 'Неизвестная ошибка API',
          bot: null
        };
      }
    } else {
      return {
        status: 'error',
        error: `HTTP ${response.status}: ${response.statusText}`,
        bot: null
      };
    }
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      return {
        status: 'error',
        error: 'Превышено время ожидания ответа',
        bot: null
      };
    }
    
    return {
      status: 'error',
      error: error.message || 'Ошибка подключения',
      bot: null
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, botType, webhookUrl } = await request.json();
    
    if (action === 'setWebhook') {
      const settings = await SettingsService.getBotSettings();
      const token = botType === 'client' ? settings.client_bot_token : settings.admin_bot_token;
      
      if (!token) {
        return NextResponse.json(
          { error: 'Токен бота не настроен' },
          { status: 400 }
        );
      }

      const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
          max_connections: 40
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        return NextResponse.json({
          success: true,
          message: 'Webhook успешно установлен'
        });
      } else {
        return NextResponse.json(
          { error: data.description || 'Ошибка установки webhook' },
          { status: 400 }
        );
      }
    }

    if (action === 'deleteWebhook') {
      const settings = await SettingsService.getBotSettings();
      const token = botType === 'client' ? settings.client_bot_token : settings.admin_bot_token;
      
      if (!token) {
        return NextResponse.json(
          { error: 'Токен бота не настроен' },
          { status: 400 }
        );
      }

      const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.ok) {
        return NextResponse.json({
          success: true,
          message: 'Webhook успешно удален'
        });
      } else {
        return NextResponse.json(
          { error: data.description || 'Ошибка удаления webhook' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Неизвестное действие' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Error in bot status action:', error);
    return NextResponse.json(
      { error: 'Ошибка выполнения действия' },
      { status: 500 }
    );
  }
}