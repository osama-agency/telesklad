import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Получение всех настроек
export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    
    // Преобразуем в удобный формат
    const settingsMap = settings.reduce((acc, setting) => {
      if (setting.variable) {
        acc[setting.variable] = setting.value || '';
      }
      return acc;
    }, {} as Record<string, string>);

    // Получаем уровни лояльности
    const loyaltyTiers = await prisma.account_tiers.findMany({
      orderBy: { order_threshold: 'asc' }
    });

    // Получаем статистику по заказам пользователей
    const orderStats = await prisma.users.groupBy({
      by: ['order_count'],
      _count: {
        id: true
      },
      orderBy: {
        order_count: 'asc'
      }
    });

    // Получаем общую статистику
    const totalUsers = await prisma.users.count();
    const usersWithOrders = await prisma.users.count({
      where: {
        order_count: {
          gt: 0
        }
      }
    });

    // Собираем настройки уведомлений
    const notificationSettings = {
      payment_reminder_first_hours: parseInt(settingsMap.notification_payment_reminder_first_hours) || 48,
      payment_reminder_final_hours: parseInt(settingsMap.notification_payment_reminder_final_hours) || 51,
      payment_auto_cancel_hours: parseInt(settingsMap.notification_payment_auto_cancel_hours) || 72,
      review_request_days: parseInt(settingsMap.notification_review_request_days) || 10
    };

    // Создаем копию для маскировки токенов ботов для безопасности
    const maskedSettings = { ...settingsMap };
    if (maskedSettings.telegram_bot_token && maskedSettings.telegram_bot_token.length > 15) {
      maskedSettings.telegram_bot_token = maskedSettings.telegram_bot_token.substring(0, 10) + '...' + maskedSettings.telegram_bot_token.slice(-4);
    }
    if (maskedSettings.webapp_telegram_bot_token && maskedSettings.webapp_telegram_bot_token.length > 15) {
      maskedSettings.webapp_telegram_bot_token = maskedSettings.webapp_telegram_bot_token.substring(0, 10) + '...' + maskedSettings.webapp_telegram_bot_token.slice(-4);
    }

    return NextResponse.json({
      settings: maskedSettings,
      loyaltyTiers: loyaltyTiers.map(tier => ({
        id: tier.id.toString(),
        title: tier.title,
        bonus_percentage: tier.bonus_percentage,
        order_threshold: tier.order_threshold,
        order_min_amount: tier.order_min_amount
      })),
      orderStats: {
        totalUsers,
        usersWithOrders,
        distribution: orderStats.map(stat => ({
          orderCount: stat.order_count,
          userCount: stat._count.id
        }))
      },
      notificationSettings
    });

  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    return NextResponse.json(
      { error: 'Ошибка получения настроек' },
      { status: 500 }
    );
  }
}

// Обновление настроек
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings, loyaltyTiers, notificationSettings } = body;

    // Обновляем обычные настройки
    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        // Пропускаем токены ботов если они замаскированы (содержат ...)
        if ((key === 'telegram_bot_token' || key === 'webapp_telegram_bot_token') && 
            String(value).includes('...')) {
          continue;
        }

        await prisma.settings.upsert({
          where: { variable: key },
          update: { 
            value: String(value),
            updated_at: new Date()
          },
          create: {
            variable: key,
            value: String(value),
            description: key.includes('token') ? 'Токен Telegram бота (зашифрован)' : undefined,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }
    }

    // Обновляем уровни лояльности
    if (loyaltyTiers && Array.isArray(loyaltyTiers)) {
      for (const tier of loyaltyTiers) {
        if (tier.id && tier.id !== 'new') {
          await prisma.account_tiers.update({
            where: { id: BigInt(tier.id) },
            data: {
              title: tier.title,
              bonus_percentage: parseInt(tier.bonus_percentage),
              order_threshold: parseInt(tier.order_threshold),
              order_min_amount: parseInt(tier.order_min_amount || 0),
              updated_at: new Date()
            }
          });
        }
      }
    }

    // Обновляем настройки уведомлений
    if (notificationSettings) {
      const notificationSettingsMap = {
        notification_payment_reminder_first_hours: notificationSettings.payment_reminder_first_hours?.toString(),
        notification_payment_reminder_final_hours: notificationSettings.payment_reminder_final_hours?.toString(),
        notification_payment_auto_cancel_hours: notificationSettings.payment_auto_cancel_hours?.toString(),
        notification_review_request_days: notificationSettings.review_request_days?.toString()
      };

      for (const [key, value] of Object.entries(notificationSettingsMap)) {
        if (value !== undefined) {
          await prisma.settings.upsert({
            where: { variable: key },
            update: { 
              value: value,
              updated_at: new Date()
            },
            create: {
              variable: key,
              value: value,
              description: `Настройка уведомлений: ${key}`,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения настроек' },
      { status: 500 }
    );
  }
} 