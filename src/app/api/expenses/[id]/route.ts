import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const expenseId = parseInt(id);
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
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

    const expense = await prisma.expense.update({
      where: {
        id: expenseId,
        user: {
          email: session.user.email
        }
      },
      data: {
        date,
        category,
        description,
        amount
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const expenseId = parseInt(id);
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
    }

    await prisma.expense.delete({
      where: {
        id: expenseId,
        user: {
          email: session.user.email
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 