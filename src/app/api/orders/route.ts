import { isDemoUser } from '@/lib/auth-helpers'

// GET /api/orders - получить список заказов
export async function GET(request: Request) {
  try {
    // Проверяем, является ли пользователь демо пользователем
    if (await isDemoUser()) {
      // Перенаправляем на демо API
      const { searchParams } = new URL(request.url)
      const demoUrl = new URL('/api/demo/orders', request.url)

      demoUrl.search = searchParams.toString()

      return fetch(demoUrl.toString(), {
        method: 'GET',
        headers: request.headers
      })
    }

    // Оригинальная логика для обычных пользователей
    try {
      // Пробуем получить данные с backend сервера
      const response = await fetch('http://localhost:3011/api/orders', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()

        return Response.json(data)
      }

      console.error(`Backend returned ${response.status}`)
    } catch (backendError) {
      console.error('Error fetching orders:', backendError)
    }

    // Если backend недоступен, возвращаем пустой массив вместо ошибки
    return Response.json({
      success: true,
      data: {
        orders: [],
        total: 0,
        message: 'Backend сервер временно недоступен'
      }
    })
  } catch (error) {
    console.error('Error in orders API:', error)

    return Response.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
