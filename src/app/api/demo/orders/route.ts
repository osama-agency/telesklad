import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

// Демо данные заказов с фиктивными клиентами
const DEMO_ORDERS = [
  {
    id: 'demo_order_1',
    externalId: 'KLY-2024-001',
    customerName: 'Анна Петрова',
    customerEmail: 'anna.petrova@email.com',
    customerPhone: '+7 (495) 123-45-67',
    customerCity: 'Москва',
    customerAddress: 'ул. Тверская, д. 15, кв. 42',
    status: 'доставлен',
    total: 847.96,
    currency: 'RUB',
    orderDate: new Date('2024-06-10T14:30:00'),
    deliveryCost: 250.00,
    items: [
      { name: 'Kalyon Universal Cleaner 1L', quantity: 2, price: 299.99, total: 599.98 },
      { name: 'Kalyon Air Freshener 300ml', quantity: 1, price: 129.99, total: 129.99 }
    ]
  },
  {
    id: 'demo_order_2',
    externalId: 'KLY-2024-002',
    customerName: 'Михаил Иванов',
    customerEmail: 'mikhail.ivanov@email.com',
    customerPhone: '+7 (812) 987-65-43',
    customerCity: 'Санкт-Петербург',
    customerAddress: 'Невский проспект, д. 28, офис 12',
    status: 'в обработке',
    total: 1049.94,
    currency: 'RUB',
    orderDate: new Date('2024-06-11T09:15:00'),
    deliveryCost: 300.00,
    items: [
      { name: 'Kalyon Bathroom Cleaner 1L', quantity: 1, price: 349.99, total: 349.99 },
      { name: 'Kalyon Fabric Softener 2L', quantity: 1, price: 399.99, total: 399.99 }
    ]
  },
  {
    id: 'demo_order_3',
    externalId: 'KLY-2024-003',
    customerName: 'Елена Смирнова',
    customerEmail: 'elena.smirnova@email.com',
    customerPhone: '+7 (495) 234-56-78',
    customerCity: 'Москва',
    customerAddress: 'ул. Арбат, д. 7, кв. 89',
    status: 'отправлен',
    total: 729.95,
    currency: 'RUB',
    orderDate: new Date('2024-06-11T16:45:00'),
    deliveryCost: 250.00,
    items: [
      { name: 'Kalyon Floor Cleaner 1.5L', quantity: 1, price: 259.99, total: 259.99 },
      { name: 'Kalyon Glass Cleaner 750ml', quantity: 1, price: 199.99, total: 199.99 },
      { name: 'Kalyon Air Freshener 300ml', quantity: 2, price: 129.99, total: 259.98 }
    ]
  },
  {
    id: 'demo_order_4',
    externalId: 'KLY-2024-004',
    customerName: 'Дмитрий Козлов',
    customerEmail: 'dmitry.kozlov@email.com',
    customerPhone: '+7 (343) 555-44-33',
    customerCity: 'Екатеринбург',
    customerAddress: 'ул. Ленина, д. 45, кв. 23',
    status: 'оплачен',
    total: 449.98,
    currency: 'RUB',
    orderDate: new Date('2024-06-12T11:20:00'),
    deliveryCost: 350.00,
    items: [
      { name: 'Kalyon Dishwashing Liquid 500ml', quantity: 3, price: 149.99, total: 449.97 }
    ]
  },
  {
    id: 'demo_order_5',
    externalId: 'KLY-2024-005',
    customerName: 'Ольга Федорова',
    customerEmail: 'olga.fedorova@email.com',
    customerPhone: '+7 (495) 777-88-99',
    customerCity: 'Москва',
    customerAddress: 'ул. Красная Площадь, д. 1, кв. 100',
    status: 'новый',
    total: 1199.94,
    currency: 'RUB',
    orderDate: new Date('2024-06-13T08:30:00'),
    deliveryCost: 0.00,
    items: [
      { name: 'Kalyon Carpet Cleaner 1L', quantity: 2, price: 449.99, total: 899.98 },
      { name: 'Kalyon Kitchen Degreaser 500ml', quantity: 1, price: 179.99, total: 179.99 },
      { name: 'Kalyon Air Freshener 300ml', quantity: 1, price: 129.99, total: 129.99 }
    ]
  },
  {
    id: 'demo_order_6',
    externalId: 'KLY-2024-006',
    customerName: 'Сергей Волков',
    customerEmail: 'sergey.volkov@email.com',
    customerPhone: '+7 (495) 111-22-33',
    customerCity: 'Москва',
    customerAddress: 'Садовое кольцо, д. 22, кв. 8',
    status: 'доставлен',
    total: 579.97,
    currency: 'RUB',
    orderDate: new Date('2024-06-08T13:45:00'),
    deliveryCost: 250.00,
    items: [
      { name: 'Kalyon Toilet Bowl Cleaner 750ml', quantity: 2, price: 229.99, total: 459.98 },
      { name: 'Kalyon Air Freshener 300ml', quantity: 1, price: 129.99, total: 129.99 }
    ]
  },
  {
    id: 'demo_order_7',
    externalId: 'KLY-2024-007',
    customerName: 'Татьяна Морозова',
    customerEmail: 'tatiana.morozova@email.com',
    customerPhone: '+7 (812) 444-55-66',
    customerCity: 'Санкт-Петербург',
    customerAddress: 'Дворцовая площадь, д. 5, кв. 15',
    status: 'отменен',
    total: 299.99,
    currency: 'RUB',
    orderDate: new Date('2024-06-09T17:30:00'),
    deliveryCost: 300.00,
    items: [
      { name: 'Kalyon Universal Cleaner 1L', quantity: 1, price: 299.99, total: 299.99 }
    ]
  },
  {
    id: 'demo_order_8',
    externalId: 'KLY-2024-008',
    customerName: 'Александр Соколов',
    customerEmail: 'alexander.sokolov@email.com',
    customerPhone: '+7 (495) 666-77-88',
    customerCity: 'Москва',
    customerAddress: 'ул. Пушкина, д. 10, кв. 25',
    status: 'в обработке',
    total: 669.96,
    currency: 'RUB',
    orderDate: new Date('2024-06-12T20:15:00'),
    deliveryCost: 250.00,
    items: [
      { name: 'Kalyon Floor Cleaner 1.5L', quantity: 2, price: 259.99, total: 519.98 },
      { name: 'Kalyon Dishwashing Liquid 500ml', quantity: 1, price: 149.99, total: 149.99 }
    ]
  }
]

// Хранилище изменений для демо режима
let demoOrdersState = [...DEMO_ORDERS]

// Функция для сброса демо данных
function resetDemoData() {
  demoOrdersState = [...DEMO_ORDERS]
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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    // Фильтрация по поиску и статусу
    const filteredOrders = demoOrdersState.filter(order => {
      const matchesSearch = search ?
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.externalId.toLowerCase().includes(search.toLowerCase()) : true
      const matchesStatus = status ? order.status === status : true
      return matchesSearch && matchesStatus
    })

    // Пагинация
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

    return NextResponse.json({
      orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit)
      }
    })

  } catch (error) {
    console.error('Ошибка при получении демо заказов:', error)
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

    // Добавляем новый демо заказ
    const newOrder = {
      id: `demo_order_${Date.now()}`,
      externalId: `KLY-2024-${String(demoOrdersState.length + 1).padStart(3, '0')}`,
      ...data,
      orderDate: new Date(),
      currency: 'RUB'
    }

    demoOrdersState.push(newOrder)

    return NextResponse.json(newOrder, { status: 201 })

  } catch (error) {
    console.error('Ошибка при создании демо заказа:', error)
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

    // Находим и обновляем заказ
    const orderIndex = demoOrdersState.findIndex(o => o.id === id)
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    demoOrdersState[orderIndex] = { ...demoOrdersState[orderIndex], ...updateData }

    return NextResponse.json(demoOrdersState[orderIndex])

  } catch (error) {
    console.error('Ошибка при обновлении демо заказа:', error)
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

    // Удаляем заказ
    const orderIndex = demoOrdersState.findIndex(o => o.id === id)
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    demoOrdersState.splice(orderIndex, 1)

    return NextResponse.json({ message: 'Заказ удален' })

  } catch (error) {
    console.error('Ошибка при удалении демо заказа:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// Endpoint для сброса демо данных
export async function PATCH() {
  resetDemoData()
  return NextResponse.json({ message: 'Демо данные заказов сброшены' })
}
