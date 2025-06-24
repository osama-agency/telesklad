import { NextRequest, NextResponse } from 'next/server';
import { TelegramMessageTemplatesService } from '@/lib/services/telegram-message-templates.service';
import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await TelegramMessageTemplatesService.getAllTemplates();
    
    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('❌ Error getting templates:', error);
    return NextResponse.json(
      { error: 'Ошибка получения шаблонов' },
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

    const { templates } = await request.json();
    
    if (!Array.isArray(templates)) {
      return NextResponse.json(
        { error: 'Неверный формат данных' },
        { status: 400 }
      );
    }

    // Сохраняем каждый шаблон
    for (const template of templates) {
      if (template.key && template.template !== undefined) {
        await TelegramMessageTemplatesService.setTemplate(
          template.key,
          template.template,
          template.description
        );
      }
    }

    // Очищаем кэш
    TelegramMessageTemplatesService.clearCache();
    
    return NextResponse.json({
      success: true,
      message: 'Шаблоны успешно сохранены'
    });
  } catch (error) {
    console.error('❌ Error saving templates:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения шаблонов' },
      { status: 500 }
    );
  }
} 