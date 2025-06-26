import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Проверяем, есть ли уже записи
    const existingCount = await prisma.support_entries.count();
    
    if (existingCount > 0) {
      return NextResponse.json({
        success: false,
        message: 'Тестовые данные уже существуют'
      });
    }

    // Создаем тестовые записи FAQ
    const testEntries = [
      {
        question: 'Как оформить заказ?',
        answer: 'Для оформления заказа выберите нужные товары, добавьте их в корзину и нажмите "Оформить заказ". Заполните контактные данные и выберите способ оплаты.',
      },
      {
        question: 'Какие способы оплаты доступны?',
        answer: 'Мы принимаем оплату банковскими картами, электронными кошельками и наличными при получении (в зависимости от региона доставки).',
      },
      {
        question: 'Сколько времени занимает доставка?',
        answer: 'Стандартная доставка занимает 1-3 рабочих дня в пределах города и 3-7 дней в другие регионы. Точные сроки зависят от выбранного способа доставки.',
      },
      {
        question: 'Можно ли отменить заказ?',
        answer: 'Да, заказ можно отменить до момента его отправки. Для отмены свяжитесь с нашей службой поддержки или воспользуйтесь функцией отмены в личном кабинете.',
      },
      {
        question: 'Как получить возврат средств?',
        answer: 'Возврат средств осуществляется в течение 7-14 рабочих дней на тот же способ платежа, который использовался при оплате заказа. Для возврата обратитесь в службу поддержки.',
      }
    ];

    // Создаем записи в базе данных
    for (const entry of testEntries) {
      await prisma.support_entries.create({
        data: {
          question: entry.question,
          answer: entry.answer,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Создано ${testEntries.length} тестовых записей FAQ`
    });

  } catch (error) {
    console.error('Error creating test FAQ data:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания тестовых данных' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
