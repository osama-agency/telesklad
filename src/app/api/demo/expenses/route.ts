import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

// Демо данные расходов
const DEMO_EXPENSES = [
  {
    id: 'demo_expense_1',
    date: new Date('2024-06-10T10:30:00'),
    category: 'Логистика',
    amount: 15000.00,
    comment: 'Доставка товаров Kalyon из Турции',
    productId: null
  },
  {
    id: 'demo_expense_2',
    date: new Date('2024-06-11T14:15:00'),
    category: 'Закупка товаров',
    amount: 45000.00,
    comment: 'Закупка партии моющих средств Kalyon',
    productId: 1
  },
  {
    id: 'demo_expense_3',
    date: new Date('2024-06-11T16:45:00'),
    category: 'Прочее',
    amount: 2500.00,
    comment: 'Упаковочные материалы',
    productId: null
  },
  {
    id: 'demo_expense_4',
    date: new Date('2024-06-12T09:20:00'),
    category: 'Логистика',
    amount: 8500.00,
    comment: 'Курьерская доставка по Москве',
    productId: null
  },
  {
    id: 'demo_expense_5',
    date: new Date('2024-06-12T13:30:00'),
    category: 'Закупка товаров',
    amount: 25000.00,
    comment: 'Пополнение склада освежителями воздуха',
    productId: 10
  },
  {
    id: 'demo_expense_6',
    date: new Date('2024-06-13T08:45:00'),
    category: 'Прочее',
    amount: 1200.00,
    comment: 'Канцелярские товары для офиса',
    productId: null
  },
  {
    id: 'demo_expense_7',
    date: new Date('2024-06-13T11:15:00'),
    category: 'Логистика',
    amount: 12000.00,
    comment: 'Международная доставка EMS',
    productId: null
  },
  {
    id: 'demo_expense_8',
    date: new Date('2024-06-09T15:30:00'),
    category: 'Закупка товаров',
    amount: 32000.00,
    comment: 'Закупка средств для ванной комнаты',
    productId: 4
  }
]

// Хранилище изменений для демо режима
let demoExpensesState = [...DEMO_EXPENSES]

// Функция для сброса демо данных
function resetDemoData() {
  demoExpensesState = [...DEMO_EXPENSES]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Проверяем, что это демо пользователь
    if (!session?.user?.email || session.user.email !== 'demo@demo.com') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') || ''

    // Фильтрация по категории
    const filteredExpenses = demoExpensesState.filter(expense => {
      return category ? expense.category === category : true
    })

    // Сортировка по дате (новые сначала)
    filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Пагинация
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex)

    return NextResponse.json({
      expenses: paginatedExpenses,
      pagination: {
        page,
        limit,
        total: filteredExpenses.length,
        totalPages: Math.ceil(filteredExpenses.length / limit)
      }
    })

  } catch (error) {
    console.error('Ошибка при получении демо расходов:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.email !== 'demo@demo.com') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const data = await request.json()

    // Добавляем новый демо расход
    const newExpense = {
      id: `demo_expense_${Date.now()}`,
      date: new Date(data.date || new Date()),
      category: data.category,
      amount: data.amount,
      comment: data.comment || '',
      productId: data.productId || null
    }

    demoExpensesState.push(newExpense)

    return NextResponse.json(newExpense, { status: 201 })

  } catch (error) {
    console.error('Ошибка при создании демо расхода:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.email !== 'demo@demo.com') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const data = await request.json()
    const { id, ...updateData } = data

    // Находим и обновляем расход
    const expenseIndex = demoExpensesState.findIndex(e => e.id === id)
    if (expenseIndex === -1) {
      return NextResponse.json({ error: 'Расход не найден' }, { status: 404 })
    }

    demoExpensesState[expenseIndex] = { ...demoExpensesState[expenseIndex], ...updateData }

    return NextResponse.json(demoExpensesState[expenseIndex])

  } catch (error) {
    console.error('Ошибка при обновлении демо расхода:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.email !== 'demo@demo.com') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Удаляем расход
    const expenseIndex = demoExpensesState.findIndex(e => e.id === id)
    if (expenseIndex === -1) {
      return NextResponse.json({ error: 'Расход не найден' }, { status: 404 })
    }

    demoExpensesState.splice(expenseIndex, 1)

    return NextResponse.json({ message: 'Расход удален' })

  } catch (error) {
    console.error('Ошибка при удалении демо расхода:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// Endpoint для сброса демо данных
export async function PATCH() {
  resetDemoData()
  return NextResponse.json({ message: 'Демо данные расходов сброшены' })
}
