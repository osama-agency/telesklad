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

    // Возвращаем данные FAQ
    return NextResponse.json({
      success: true,
      faq_items: faqItems,
      support_contacts: {
        telegram: settingsMap.tg_support || "@your_support_bot",
        telegram_url: settingsMap.tg_support ? `https://t.me/${settingsMap.tg_support.replace('@', '')}` : "https://t.me/your_support_bot",
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