import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export async function GET(request: NextRequest) {
  try {
    // Загружаем FAQ из базы данных
    const supportEntries = await prisma.support_entries.findMany({
      orderBy: {
        question: 'asc'
      }
    });

    // Преобразуем в нужный формат
    const faqItems: FAQItem[] = supportEntries.map(entry => ({
      id: Number(entry.id),
      question: entry.question || '',
      answer: entry.answer || ''
    }));

    // Получаем настройки поддержки из таблицы settings
    const supportSettings = await prisma.settings.findMany({
      where: {
        variable: {
          in: ['tg_support', 'support_working_hours', 'support_response_time']
        }
      }
    });

    // Создаем объект настроек
    const settingsMap = supportSettings.reduce((acc, setting) => {
      acc[setting.variable || ''] = setting.value || '';
      return acc;
    }, {} as Record<string, string>);

    // Формируем правильную ссылку на Telegram
    const telegramUsername = settingsMap.tg_support || "https://t.me/strattera_help";
    let telegramUrl = "https://t.me/strattera_help";
    
    if (telegramUsername) {
      // Если это полная ссылка (начинается с https://t.me/)
      if (telegramUsername.startsWith('https://t.me/')) {
        telegramUrl = telegramUsername;
      }
      // Если это username с @ или без
      else {
        const cleanUsername = telegramUsername.replace('@', '');
        telegramUrl = `https://t.me/${cleanUsername}`;
      }
    }

    // Возвращаем данные FAQ
    return NextResponse.json({
      success: true,
      faq_items: faqItems,
      support_contacts: {
        telegram: telegramUsername,
        telegram_url: telegramUrl,
        working_hours: settingsMap.support_working_hours || "Пн-Пт 9:00-18:00 МСК",
        response_time: settingsMap.support_response_time || "В течение 15 минут"
      }
    });

  } catch (error) {
    console.error('Support API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки данных поддержки' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Добавление новой записи FAQ
export async function POST(request: NextRequest) {
  try {
    const { question, answer } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Вопрос и ответ обязательны' },
        { status: 400 }
      );
    }

    const newEntry = await prisma.support_entries.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: Number(newEntry.id),
        question: newEntry.question || '',
        answer: newEntry.answer || ''
      }
    });

  } catch (error) {
    console.error('Support POST API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания записи' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Обновление записи FAQ
export async function PUT(request: NextRequest) {
  try {
    const { id, question, answer } = await request.json();

    if (!id || !question || !answer) {
      return NextResponse.json(
        { success: false, error: 'ID, вопрос и ответ обязательны' },
        { status: 400 }
      );
    }

    const updatedEntry = await prisma.support_entries.update({
      where: { id: BigInt(id) },
      data: {
        question: question.trim(),
        answer: answer.trim(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      entry: {
        id: Number(updatedEntry.id),
        question: updatedEntry.question || '',
        answer: updatedEntry.answer || ''
      }
    });

  } catch (error) {
    console.error('Support PUT API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления записи' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Удаление записи FAQ
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID обязателен' },
        { status: 400 }
      );
    }

    await prisma.support_entries.delete({
      where: { id: BigInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Запись успешно удалена'
    });

  } catch (error) {
    console.error('Support DELETE API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления записи' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 