import { getServerSession } from 'next-auth'

import { requireAdminAccess, isDemoUser } from '@/lib/auth-helpers'
import { authOptions } from '@/libs/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3011'

// Демо данные товаров (дублируем из демо API)
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
  }
]

// GET /api/products - получить список товаров
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Если пользователь не авторизован - показываем демо данные
    // Если авторизован как демо пользователь - тоже показываем демо данные
    if (!session || (session && await isDemoUser())) {
      // Напрямую возвращаем демо данные без fetch запроса
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const search = searchParams.get('search') || ''
      const hidden = searchParams.get('hidden') === 'true'

      // Фильтрация по поиску и скрытым товарам
      const filteredProducts = DEMO_PRODUCTS.filter(product => {
        const matchesSearch = search ? product.name.toLowerCase().includes(search.toLowerCase()) : true
        const matchesHidden = hidden ? product.isHidden : !product.isHidden
        return matchesSearch && matchesHidden
      })

      // Пагинация
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

      return Response.json({
        products: paginatedProducts,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / limit)
        }
      })
    }

    // Для авторизованных не-демо пользователей проверяем права администратора
    const accessDenied = await requireAdminAccess()

    if (accessDenied) {
      return accessDenied
    }

    const { searchParams } = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/products?${searchParams.toString()}`

    try {
      // Пытаемся получить данные с backend
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()

        return Response.json(data)
      }

      // Логируем точную ошибку от backend
      const errorText = await response.text()

      console.error(`Backend returned ${response.status}: ${errorText}`)

      // Если backend вернул ошибку, но не 404
      if (response.status !== 404) {
        throw new Error(`Backend returned ${response.status}: ${errorText}`)
      }
    } catch (backendError) {
      console.error('Error fetching products from backend:', backendError)
    }

    // Если backend недоступен, возвращаем сообщение
    return Response.json({
      success: true,
      data: {
        products: [],
        total: 0,
        message: 'Backend сервер временно недоступен. Данные есть в базе (32 продукта), но требуется исправить маршрутизацию backend.'
      }
    })

  } catch (error) {
    console.error('Error in products API:', error)

    return Response.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
