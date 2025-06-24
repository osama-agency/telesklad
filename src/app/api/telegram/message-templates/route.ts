import { NextRequest, NextResponse } from 'next/server';
import { TelegramMessageTemplatesService } from '@/lib/services/telegram-message-templates.service';

// GET - получить все шаблоны
export async function GET() {
  try {
    const templates = await TelegramMessageTemplatesService.getAllTemplates();
    
    return NextResponse.json({
      success: true,
      templates: templates,
      count: templates.length
    });

  } catch (error) {
    console.error('❌ Templates API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка загрузки шаблонов сообщений'
    }, { status: 500 });
  }
}

// POST - создать или обновить шаблон
export async function POST(request: NextRequest) {
  try {
    const { key, template, description, action } = await request.json();

    if (!key || !template) {
      return NextResponse.json({
        success: false,
        error: 'Поля key и template обязательны'
      }, { status: 400 });
    }

    if (action === 'init_defaults') {
      // Инициализация шаблонов по умолчанию
      await TelegramMessageTemplatesService.initializeDefaultTemplates();
      
      return NextResponse.json({
        success: true,
        message: 'Шаблоны по умолчанию инициализированы'
      });
    }

    if (action === 'force_update') {
      // Принудительное обновление всех шаблонов
      await TelegramMessageTemplatesService.initializeDefaultTemplates();
      
      return NextResponse.json({
        success: true,
        message: 'Все шаблоны принудительно обновлены'
      });
    }

    // Создание/обновление одного шаблона
    const result = await TelegramMessageTemplatesService.setTemplate(key, template, description);
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Шаблон сохранен',
        key: key
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Ошибка сохранения шаблона'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Template save error:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка сохранения шаблона'
    }, { status: 500 });
  }
}

// DELETE - очистить кэш шаблонов
export async function DELETE() {
  try {
    TelegramMessageTemplatesService.clearCache();
    
    return NextResponse.json({
      success: true,
      message: 'Кэш шаблонов очищен'
    });

  } catch (error) {
    console.error('❌ Cache clear error:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка очистки кэша'
    }, { status: 500 });
  }
} 