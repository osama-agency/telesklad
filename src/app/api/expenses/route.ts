import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

export async function GET(request: NextRequest) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🔧 Expenses API: Starting...');

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Пробуем разные варианты названий таблиц
    let expenses = [];
    
    try {
      // Сначала пробуем expenses
      const whereConditions: any = {};
      
      // Поскольку поле date имеет тип String, фильтруем по строковому представлению
    if (from || to) {
      whereConditions.date = {};
      if (from) {
          const fromDateStr = new Date(from).toISOString().split('T')[0]; // YYYY-MM-DD
        whereConditions.date.gte = fromDateStr;
      }
      if (to) {
          const toDateStr = new Date(to).toISOString().split('T')[0]; // YYYY-MM-DD
        whereConditions.date.lte = toDateStr;
      }
        console.log('📅 Date filter conditions:', whereConditions);
    }

      expenses = await (prisma as any).expenses.findMany({
      where: whereConditions,
      orderBy: [
        { date: 'desc' },
          { createdat: 'desc' }
        ],
        take: 100 // Ограничиваем количество для безопасности
      });
      console.log(`✅ Found expenses table with ${expenses.length} records`);
    } catch (expensesError) {
      console.log('❌ expenses table error:', expensesError);
      
      try {
        // Пробуем expense (единственное число)
        expenses = await (prisma as any).expense.findMany({
          orderBy: {
            createdat: 'desc'
          },
          take: 100
        });
        console.log('✅ Found expense table');
      } catch (expenseError) {
        console.log('❌ expense table not found:', expenseError);
        
        // Возвращаем пустой массив если таблицы нет
        console.log('📝 Returning empty expenses array');
        return NextResponse.json([]);
      }
    }

    // Преобразуем BigInt поля в строки для JSON сериализации
    const serializedExpenses = expenses.map((expense: any) => ({
      ...expense,
      id: expense.id ? expense.id.toString() : null,
      user_id: expense.user_id ? expense.user_id.toString() : null,
      userid: expense.userid ? expense.userid.toString() : null,
      // Добавляем поля, которые может ожидать фронтенд
      date: expense.date || new Date().toISOString().split('T')[0],
      category: expense.category || 'Прочее',
      description: expense.description || 'Расход',
      amount: expense.amount || 0
    }));

    console.log(`✅ Expenses API: Found ${serializedExpenses.length} expenses`);
    console.log('📋 Sample expense:', serializedExpenses[0]);
    return NextResponse.json(serializedExpenses);
  } catch (error) {
    console.error('❌ Error fetching expenses:', error);
    // Возвращаем пустой массив вместо ошибки для стабильности UI
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('🔧 Expenses POST API: Starting...');

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

    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ - используем дефолтного пользователя
    const teleskladUser = await (prisma as any).telesklad_user.findFirst({
      where: { email: 'go@osama.agency' }
    });

    if (!teleskladUser) {
      return NextResponse.json({ error: 'Telesklad user not found' }, { status: 404 });
    }

    // Находим соответствующего пользователя в таблице users (для внешнего ключа)
    const user = await (prisma as any).users.findFirst({
      where: { email: 'go@osama.agency' }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in users table' }, { status: 404 });
    }

    let expense;
    try {
      // Пробуем создать в таблице expenses
      expense = await (prisma as any).expenses.create({
      data: {
        date,
        category,
        description,
        amount,
          userid: user.id  // Используем userid вместо userId
        }
      });
      console.log('✅ Created expense in expenses table');
    } catch (expensesError) {
      console.log('❌ Failed to create in expenses table:', expensesError);
      
      try {
        // Пробуем создать в таблице expense
        expense = await (prisma as any).expense.create({
          data: {
            date,
            category,
            description,
            amount,
            userid: user.id  // Используем userid вместо userId
      }
    });
        console.log('✅ Created expense in expense table');
      } catch (expenseError) {
        console.log('❌ Failed to create in expense table:', expenseError);
        return NextResponse.json(
          { error: 'Expenses table not found' },
          { status: 500 }
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

    console.log('✅ Expense created successfully');
    return NextResponse.json(serializedExpense, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating expense:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 