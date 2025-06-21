import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - получить все банковские карты
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const active = searchParams.get('active');

    const where: any = {};

    // Фильтр по поиску
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fio: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтр по активности
    if (active !== null && active !== undefined && active !== '') {
      where.active = active === 'true';
    }

    const [bankCards, totalCount] = await Promise.all([
      prisma.bank_cards.findMany({
        where,
        orderBy: [
          { active: 'desc' },
          { created_at: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              orders: true
            }
          }
        }
      }),
      prisma.bank_cards.count({ where })
    ]);

    // Статистика
    const stats = await prisma.bank_cards.aggregate({
      _count: { id: true },
      where: { active: true }
    });

    const totalStats = await prisma.bank_cards.aggregate({
      _count: { id: true }
    });

    return NextResponse.json({
      cards: bankCards.map(card => ({
        id: card.id.toString(),
        name: card.name,
        fio: card.fio,
        number: card.number,
        active: card.active,
        orders_count: card._count.orders,
        created_at: card.created_at.toISOString(),
        updated_at: card.updated_at.toISOString()
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: {
        total_cards: totalStats._count.id,
        active_cards: stats._count.id,
        inactive_cards: totalStats._count.id - stats._count.id
      }
    });

  } catch (error) {
    console.error('Error fetching bank cards:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении банковских карт' },
      { status: 500 }
    );
  }
}

// POST - создать новую банковскую карту
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, fio, number, active = true } = body;

    // Валидация
    if (!name || !fio || !number) {
      return NextResponse.json(
        { error: 'Обязательные поля: название банка, ФИО, номер карты/телефона' },
        { status: 400 }
      );
    }

    // Проверяем уникальность номера карты
    const existingCard = await prisma.bank_cards.findFirst({
      where: { number }
    });

    if (existingCard) {
      return NextResponse.json(
        { error: 'Карта с таким номером уже существует' },
        { status: 400 }
      );
    }

    const newCard = await prisma.bank_cards.create({
      data: {
        name,
        fio,
        number,
        active,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      card: {
        id: newCard.id.toString(),
        name: newCard.name,
        fio: newCard.fio,
        number: newCard.number,
        active: newCard.active,
        orders_count: 0,
        created_at: newCard.created_at.toISOString(),
        updated_at: newCard.updated_at.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating bank card:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании банковской карты' },
      { status: 500 }
    );
  }
}

// PUT - обновить банковскую карту
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, fio, number, active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID карты обязателен' },
        { status: 400 }
      );
    }

    // Проверяем существование карты
    const existingCard = await prisma.bank_cards.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Карта не найдена' },
        { status: 404 }
      );
    }

    // Проверяем уникальность номера карты (если он изменился)
    if (number && number !== existingCard.number) {
      const duplicateCard = await prisma.bank_cards.findFirst({
        where: { 
          number,
          id: { not: BigInt(id) }
        }
      });

      if (duplicateCard) {
        return NextResponse.json(
          { error: 'Карта с таким номером уже существует' },
          { status: 400 }
        );
      }
    }

    const updatedCard = await prisma.bank_cards.update({
      where: { id: BigInt(id) },
      data: {
        name: name || existingCard.name,
        fio: fio || existingCard.fio,
        number: number || existingCard.number,
        active: active !== undefined ? active : existingCard.active,
        updated_at: new Date()
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      card: {
        id: updatedCard.id.toString(),
        name: updatedCard.name,
        fio: updatedCard.fio,
        number: updatedCard.number,
        active: updatedCard.active,
        orders_count: updatedCard._count.orders,
        created_at: updatedCard.created_at.toISOString(),
        updated_at: updatedCard.updated_at.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating bank card:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении банковской карты' },
      { status: 500 }
    );
  }
}

// DELETE - удалить банковскую карту
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID карты обязателен' },
        { status: 400 }
      );
    }

    // Проверяем существование карты
    const existingCard = await prisma.bank_cards.findUnique({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: {
            orders: true
          }
        }
      }
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Карта не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные заказы
    if (existingCard._count.orders > 0) {
      return NextResponse.json(
        { error: `Нельзя удалить карту, так как с ней связано ${existingCard._count.orders} заказов. Деактивируйте карту вместо удаления.` },
        { status: 400 }
      );
    }

    await prisma.bank_cards.delete({
      where: { id: BigInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Банковская карта успешно удалена'
    });

  } catch (error) {
    console.error('Error deleting bank card:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении банковской карты' },
      { status: 500 }
    );
  }
} 