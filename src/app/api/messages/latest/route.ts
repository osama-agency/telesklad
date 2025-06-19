import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prismaDb';

// GET - получение новых сообщений с определенного времени
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметры
    const tg_id = searchParams.get('tg_id');
    const since = searchParams.get('since'); // ISO timestamp
    
    if (!since) {
      return NextResponse.json(
        { error: 'Since parameter is required' },
        { status: 400 }
      );
    }

    // Фильтры
    const where: any = {
      created_at: {
        gt: new Date(since)
      }
    };
    
    if (tg_id) {
      where.tg_id = BigInt(tg_id);
    }

    // Получаем новые сообщения
    const messages = await (prisma as any).messages.findMany({
      where,
      orderBy: { created_at: 'asc' },
      take: 100, // Ограничиваем количество сообщений
    });

    // Преобразуем BigInt в строки
    const serializedMessages = messages.map((message: any) => ({
      ...message,
      id: message.id.toString(),
      tg_id: message.tg_id ? message.tg_id.toString() : null,
      tg_msg_id: message.tg_msg_id ? message.tg_msg_id.toString() : null,
    }));

    return NextResponse.json({
      messages: serializedMessages,
      count: serializedMessages.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching latest messages:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 