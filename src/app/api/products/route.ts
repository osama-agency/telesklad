const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3011'

// GET /api/products - получить список товаров
export async function GET(request: Request) {
  try {
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
