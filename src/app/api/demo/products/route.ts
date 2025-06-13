import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

// Демо данные товаров бытовой химии Kalyon
const DEMO_PRODUCTS = [
  {
    id: 1,
    name: 'Kalyon Universal Cleaner 1L',
    category: 'Моющие средства',
    price: 299.99,
    costPrice: 180.00,
    stockQuantity: 45,
    brand: 'Kalyon',
    description: 'Универсальное моющее средство для всех поверхностей',
    avgDailySales30d: 2.3,
    daysToZero: 19,
    isHidden: false,
    trend: 'GROWING'
  },
  {
    id: 2,
    name: 'Kalyon Dishwashing Liquid 500ml',
    category: 'Средства для посуды',
    price: 149.99,
    costPrice: 89.00,
    stockQuantity: 67,
    brand: 'Kalyon',
    description: 'Концентрированная жидкость для мытья посуды',
    avgDailySales30d: 3.1,
    daysToZero: 21,
    isHidden: false,
    trend: 'STABLE'
  },
  {
    id: 3,
    name: 'Kalyon Glass Cleaner 750ml',
    category: 'Средства для стекла',
    price: 199.99,
    costPrice: 120.00,
    stockQuantity: 23,
    brand: 'Kalyon',
    description: 'Специальное средство для мытья стекол и зеркал',
    avgDailySales30d: 1.8,
    daysToZero: 12,
    isHidden: false,
    trend: 'DECLINING'
  },
  {
    id: 4,
    name: 'Kalyon Bathroom Cleaner 1L',
    category: 'Средства для ванной',
    price: 349.99,
    costPrice: 210.00,
    stockQuantity: 34,
    brand: 'Kalyon',
    description: 'Мощное средство для очистки ванной комнаты',
    avgDailySales30d: 2.7,
    daysToZero: 12,
    isHidden: false,
    trend: 'STABLE'
  },
  {
    id: 5,
    name: 'Kalyon Floor Cleaner 1.5L',
    category: 'Средства для пола',
    price: 259.99,
    costPrice: 155.00,
    stockQuantity: 89,
    brand: 'Kalyon',
    description: 'Эффективное средство для мытья всех типов полов',
    avgDailySales30d: 4.2,
    daysToZero: 21,
    isHidden: false,
    trend: 'GROWING'
  },
  {
    id: 6,
    name: 'Kalyon Kitchen Degreaser 500ml',
    category: 'Средства для кухни',
    price: 179.99,
    costPrice: 108.00,
    stockQuantity: 12,
    brand: 'Kalyon',
    description: 'Средство для удаления жира на кухне',
    avgDailySales30d: 1.5,
    daysToZero: 8,
    isHidden: false,
    trend: 'CRITICAL'
  },
  {
    id: 7,
    name: 'Kalyon Fabric Softener 2L',
    category: 'Средства для стирки',
    price: 399.99,
    costPrice: 240.00,
    stockQuantity: 56,
    brand: 'Kalyon',
    description: 'Кондиционер для белья с ароматом лаванды',
    avgDailySales30d: 2.9,
    daysToZero: 19,
    isHidden: false,
    trend: 'STABLE'
  },
  {
    id: 8,
    name: 'Kalyon Toilet Bowl Cleaner 750ml',
    category: 'Средства для туалета',
    price: 229.99,
    costPrice: 138.00,
    stockQuantity: 78,
    brand: 'Kalyon',
    description: 'Дезинфицирующее средство для унитазов',
    avgDailySales30d: 3.5,
    daysToZero: 22,
    isHidden: false,
    trend: 'GROWING'
  },
  {
    id: 9,
    name: 'Kalyon Carpet Cleaner 1L',
    category: 'Средства для ковров',
    price: 449.99,
    costPrice: 270.00,
    stockQuantity: 18,
    brand: 'Kalyon',
    description: 'Специализированное средство для чистки ковров',
    avgDailySales30d: 1.2,
    daysToZero: 15,
    isHidden: false,
    trend: 'STABLE'
  },
  {
    id: 10,
    name: 'Kalyon Air Freshener 300ml',
    category: 'Освежители воздуха',
    price: 129.99,
    costPrice: 78.00,
    stockQuantity: 134,
    brand: 'Kalyon',
    description: 'Освежитель воздуха с натуральными маслами',
    avgDailySales30d: 5.8,
    daysToZero: 23,
    isHidden: false,
    trend: 'GROWING'
  }
]

// Хранилище изменений для демо режима (в реальном приложении это было бы в Redis или базе данных)
let demoProductsState = [...DEMO_PRODUCTS]

// Функция для сброса демо данных
function resetDemoData() {
  demoProductsState = [...DEMO_PRODUCTS]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    // Проверяем, что это демо пользователь
    if (!session?.user?.email || session.user.email !== 'demo@demo.com') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const hidden = searchParams.get('hidden') === 'true'

    // Фильтрация по поиску и скрытым товарам
    let filteredProducts = demoProductsState.filter(product => {
      const matchesSearch = search ? product.name.toLowerCase().includes(search.toLowerCase()) : true
      const matchesHidden = hidden ? product.isHidden : !product.isHidden
      return matchesSearch && matchesHidden
    })

    // Пагинация
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
      }
    })

  } catch (error) {
    console.error('Ошибка при получении демо товаров:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.email || session.user.email !== 'demo@demo.com') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const data = await request.json()

    // Добавляем новый демо товар
    const newProduct = {
      id: Math.max(...demoProductsState.map(p => p.id)) + 1,
      ...data,
      brand: 'Kalyon',
      avgDailySales30d: Math.random() * 5 + 1,
      daysToZero: Math.floor(Math.random() * 30) + 5,
      isHidden: false,
      trend: ['GROWING', 'STABLE', 'DECLINING'][Math.floor(Math.random() * 3)]
    }

    demoProductsState.push(newProduct)

    return NextResponse.json(newProduct, { status: 201 })

  } catch (error) {
    console.error('Ошибка при создании демо товара:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.email || session.user.email !== 'demo@demo.com') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const data = await request.json()
    const { id, ...updateData } = data

    // Находим и обновляем товар
    const productIndex = demoProductsState.findIndex(p => p.id === id)
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }

    demoProductsState[productIndex] = { ...demoProductsState[productIndex], ...updateData }

    return NextResponse.json(demoProductsState[productIndex])

  } catch (error) {
    console.error('Ошибка при обновлении демо товара:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.email || session.user.email !== 'demo@demo.com') {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')

    // Удаляем товар
    const productIndex = demoProductsState.findIndex(p => p.id === id)
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }

    demoProductsState.splice(productIndex, 1)

    return NextResponse.json({ message: 'Товар удален' })

  } catch (error) {
    console.error('Ошибка при удалении демо товара:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// Endpoint для сброса демо данных (вызывается при выходе из аккаунта)
export async function PATCH() {
  resetDemoData()
  return NextResponse.json({ message: 'Демо данные сброшены' })
}
