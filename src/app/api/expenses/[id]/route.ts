import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🔧 Expenses PUT API: Starting...');

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

    let expense;
    try {
      // Пробуем обновить в таблице expenses
      expense = await (prisma as any).expenses.update({
        where: { id: expenseId },
        data: { date, category, description, amount }
      });
      console.log('✅ Updated expense in expenses table');
    } catch (expensesError) {
      console.log('❌ Failed to update in expenses table:', expensesError);
      
      try {
        // Пробуем обновить в таблице expense
        expense = await (prisma as any).expense.update({
          where: { id: expenseId },
          data: { date, category, description, amount }
        });
        console.log('✅ Updated expense in expense table');
      } catch (expenseError) {
        console.log('❌ Failed to update in expense table:', expenseError);
        return NextResponse.json(
          { error: 'Expense not found or table not accessible' },
          { status: 404 }
        );
      }
    }

    // Преобразуем BigInt поля в строки для JSON сериализации
    const serializedExpense = {
      ...expense,
      id: expense.id ? expense.id.toString() : null,
      user_id: expense.user_id ? expense.user_id.toString() : null,
      userid: expense.userid ? expense.userid.toString() : null,
    };

    console.log('✅ Expense updated successfully');
    return NextResponse.json(serializedExpense);
  } catch (error) {
    console.error('❌ Error updating expense:', error);
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
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🔧 Expenses DELETE API: Starting...');

    const { id } = await params;
    const expenseId = parseInt(id);
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
    }

    console.log(`🗑️ Attempting to delete expense with ID: ${expenseId}`);

    let deleted = false;
    try {
      // Пробуем удалить из таблицы expenses
      await (prisma as any).expenses.delete({
        where: { id: expenseId }
      });
      deleted = true;
      console.log('✅ Deleted expense from expenses table');
    } catch (expensesError) {
      console.log('❌ Failed to delete from expenses table:', expensesError);
      
      try {
        // Пробуем удалить из таблицы expense
        await (prisma as any).expense.delete({
          where: { id: expenseId }
        });
        deleted = true;
        console.log('✅ Deleted expense from expense table');
      } catch (expenseError) {
        console.log('❌ Failed to delete from expense table:', expenseError);
        return NextResponse.json(
          { error: 'Expense not found or table not accessible' },
          { status: 404 }
        );
      }
    }

    if (deleted) {
      console.log('✅ Expense deleted successfully');
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 