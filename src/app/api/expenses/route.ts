import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Строим условия фильтрации
    const whereConditions: any = {
      user: {
        email: session.user.email
      }
    };
    
    if (from || to) {
      whereConditions.date = {};
      if (from) {
        // Преобразуем в строку формата YYYY-MM-DD для сравнения
        const fromDateStr = new Date(from).toISOString().split('T')[0];
        whereConditions.date.gte = fromDateStr;
      }
      if (to) {
        // Преобразуем в строку формата YYYY-MM-DD для сравнения
        const toDateStr = new Date(to).toISOString().split('T')[0];
        whereConditions.date.lte = toDateStr;
      }
    }

    const expenses = await prisma.expense.findMany({
      where: whereConditions,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, category, description, amount } = body;

    // Валидация данных
    if (!date || !category || !description || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const expense = await prisma.expense.create({
      data: {
        date,
        category,
        description,
        amount,
        userId: user.id
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 