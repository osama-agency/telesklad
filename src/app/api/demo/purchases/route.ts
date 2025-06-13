import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

// Демо данные закупок
const DEMO_PURCHASES = [
  {
    id: 'demo_purchase_1',
    sequenceId: 1,
    createdAt: new Date('2024-06-10T09:00:00'),
    updatedAt: new Date('2024-06-10T09:00:00'),
    statusUpdatedAt: new Date('2024-06-11T14:30:00'),
    totalCost: 125000.00,
    logisticsCost: 15000.00,
    isUrgent: false,
    status: 'received',
    supplier: 'Kalyon Manufacturing Turkey',
    items: [
      { id: '1_1', name: 'Kalyon Universal Cleaner 1L', quantity: 50, price: 180.00, total: 9000.00 },
      { id: '1_2', name: 'Kalyon Dishwashing Liquid 500ml', quantity: 100, price: 89.00, total: 8900.00 },
      { id: '1_3', name: 'Kalyon Air Freshener 300ml', quantity: 200, price: 78.00, total: 15600.00 }
    ]
  },
  {
    id: 'demo_purchase_2',
    sequenceId: 2,
    createdAt: new Date('2024-06-11T10:30:00'),
    updatedAt: new Date('2024-06-11T10:30:00'),
    statusUpdatedAt: new Date('2024-06-12T09:15:00'),
    totalCost: 89500.00,
    logisticsCost: 12000.00,
    isUrgent: true,
    status: 'delivering',
    supplier: 'Kalyon Chemicals Ltd',
    items: [
      { id: '2_1', name: 'Kalyon Bathroom Cleaner 1L', quantity: 75, price: 210.00, total: 15750.00 },
      { id: '2_2', name: 'Kalyon Kitchen Degreaser 500ml', quantity: 120, price: 108.00, total: 12960.00 },
      { id: '2_3', name: 'Kalyon Toilet Bowl Cleaner 750ml', quantity: 80, price: 138.00, total: 11040.00 }
    ]
  },
  {
    id: 'demo_purchase_3',
    sequenceId: 3,
    createdAt: new Date('2024-06-12T14:20:00'),
    updatedAt: new Date('2024-06-12T14:20:00'),
    statusUpdatedAt: new Date('2024-06-12T14:20:00'),
    totalCost: 156000.00,
    logisticsCost: 18000.00,
    isUrgent: false,
    status: 'paid',
    supplier: 'Kalyon International Trading',
    items: [
      { id: '3_1', name: 'Kalyon Floor Cleaner 1.5L', quantity: 100, price: 155.00, total: 15500.00 },
      { id: '3_2', name: 'Kalyon Fabric Softener 2L', quantity: 60, price: 240.00, total: 14400.00 },
      { id: '3_3', name: 'Kalyon Carpet Cleaner 1L', quantity: 50, price: 270.00, total: 13500.00 },
      { id: '3_4', name: 'Kalyon Glass Cleaner 750ml', quantity: 150, price: 120.00, total: 18000.00 }
    ]
  },
  {
    id: 'demo_purchase_4',
    sequenceId: 4,
    createdAt: new Date('2024-06-13T11:45:00'),
    updatedAt: new Date('2024-06-13T11:45:00'),
    statusUpdatedAt: new Date('2024-06-13T11:45:00'),
    totalCost: 67500.00,
    logisticsCost: 8500.00,
    isUrgent: true,
    status: 'pending',
    supplier: 'Kalyon Home Care Solutions',
    items: [
      { id: '4_1', name: 'Kalyon Universal Cleaner 1L', quantity: 80, price: 180.00, total: 14400.00 },
      { id: '4_2', name: 'Kalyon Air Freshener 300ml', quantity: 150, price: 78.00, total: 11700.00 },
      { id: '4_3', name: 'Kalyon Dishwashing Liquid 500ml', quantity: 120, price: 89.00, total: 10680.00 }
    ]
  },
  {
    id: 'demo_purchase_5',
    sequenceId: 5,
    createdAt: new Date('2024-06-09T16:30:00'),
    updatedAt: new Date('2024-06-09T16:30:00'),
    statusUpdatedAt: new Date('2024-06-10T12:45:00'),
    totalCost: 198000.00,
    logisticsCost: 25000.00,
    isUrgent: false,
    status: 'in_transit',
    supplier: 'Kalyon Export Division',
    items: [
      { id: '5_1', name: 'Kalyon Bathroom Cleaner 1L', quantity: 120, price: 210.00, total: 25200.00 },
      { id: '5_2', name: 'Kalyon Fabric Softener 2L', quantity: 80, price: 240.00, total: 19200.00 },
      { id: '5_3', name: 'Kalyon Floor Cleaner 1.5L', quantity: 90, price: 155.00, total: 13950.00 },
      { id: '5_4', name: 'Kalyon Toilet Bowl Cleaner 750ml', quantity: 100, price: 138.00, total: 13800.00 }
    ]
  },
  {
    id: 'demo_purchase_6',
    sequenceId: 6,
    createdAt: new Date('2024-06-08T08:15:00'),
    updatedAt: new Date('2024-06-08T08:15:00'),
    statusUpdatedAt: new Date('2024-06-08T13:20:00'),
    totalCost: 45000.00,
    logisticsCost: 6000.00,
    isUrgent: false,
    status: 'cancelled',
    supplier: 'Kalyon Regional Office',
    items: [
      { id: '6_1', name: 'Kalyon Kitchen Degreaser 500ml', quantity: 200, price: 108.00, total: 21600.00 },
      { id: '6_2', name: 'Kalyon Glass Cleaner 750ml', quantity: 100, price: 120.00, total: 12000.00 }
    ]
  }
]

// Хранилище изменений для демо режима
let demoPurchasesState = [...DEMO_PURCHASES]

// Функция для сброса демо данных
function resetDemoData() {
  demoPurchasesState = [...DEMO_PURCHASES]
}

export async function GET(request: NextRequest) {
  try {
    // Демо API доступен для всех пользователей
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.email || session.user.email !== 'demo@demo.com') {
    //   return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const urgent = searchParams.get('urgent') === 'true'

    // Фильтрация по статусу и срочности
    const filteredPurchases = demoPurchasesState.filter(purchase => {
      const matchesStatus = status ? purchase.status === status : true
      const matchesUrgent = urgent ? purchase.isUrgent : true
      return matchesStatus && matchesUrgent
    })

    // Сортировка по дате создания (новые сначала)
    filteredPurchases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Пагинация
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedPurchases,
      pagination: {
        page,
        limit,
        total: filteredPurchases.length,
        totalPages: Math.ceil(filteredPurchases.length / limit)
      }
    })

  } catch (error) {
    console.error('Ошибка при получении демо закупок:', error)
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

    // Добавляем новую демо закупку
    const newPurchase = {
      id: `demo_purchase_${Date.now()}`,
      sequenceId: demoPurchasesState.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      statusUpdatedAt: new Date(),
      totalCost: data.totalCost || 0,
      logisticsCost: data.logisticsCost || 0,
      isUrgent: data.isUrgent || false,
      status: data.status || 'pending',
      supplier: data.supplier || 'Kalyon',
      items: data.items || []
    }

    demoPurchasesState.push(newPurchase)

    return NextResponse.json(newPurchase, { status: 201 })

  } catch (error) {
    console.error('Ошибка при создании демо закупки:', error)
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

    // Находим и обновляем закупку
    const purchaseIndex = demoPurchasesState.findIndex(p => p.id === id)
    if (purchaseIndex === -1) {
      return NextResponse.json({ error: 'Закупка не найдена' }, { status: 404 })
    }

    demoPurchasesState[purchaseIndex] = {
      ...demoPurchasesState[purchaseIndex],
      ...updateData,
      updatedAt: new Date(),
      statusUpdatedAt: updateData.status ? new Date() : demoPurchasesState[purchaseIndex].statusUpdatedAt
    }

    return NextResponse.json(demoPurchasesState[purchaseIndex])

  } catch (error) {
    console.error('Ошибка при обновлении демо закупки:', error)
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

    // Удаляем закупку
    const purchaseIndex = demoPurchasesState.findIndex(p => p.id === id)
    if (purchaseIndex === -1) {
      return NextResponse.json({ error: 'Закупка не найдена' }, { status: 404 })
    }

    demoPurchasesState.splice(purchaseIndex, 1)

    return NextResponse.json({ message: 'Закупка удалена' })

  } catch (error) {
    console.error('Ошибка при удалении демо закупки:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// Endpoint для сброса демо данных
export async function PATCH() {
  resetDemoData()
  return NextResponse.json({ message: 'Демо данные закупок сброшены' })
}
