import { type NextRequest, NextResponse } from 'next/server'

// Обработка данных от Telegram WebApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('📲 Получены данные от WebApp:', body)

    // Валидация данных
    if (!body.action || body.action !== 'changeStatus') {
      return NextResponse.json({
        success: false,
        error: 'Invalid action'
      }, { status: 400 })
    }

    if (!body.orderId || !body.newStatus) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: orderId, newStatus'
      }, { status: 400 })
    }

    // Отправляем запрос на изменение статуса в backend
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:3011'}/api/purchases/${body.orderId}/status`

    console.log('🔄 Отправляю запрос на изменение статуса:', {
      url: backendUrl,
      orderId: body.orderId,
      newStatus: body.newStatus
    })

    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: body.newStatus,
        source: 'telegram_webapp'
      })
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Статус успешно изменен через WebApp')

      return NextResponse.json({
        success: true,
        message: `Статус изменен на "${body.newStatus}"`,
        data: result
      })
    } else {
      console.error('❌ Ошибка изменения статуса:', result)

      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to update status'
      }, { status: response.status })
    }

  } catch (error) {
    console.error('❌ Ошибка обработки WebApp данных:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// Обработка GET запросов для проверки статуса
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Telegram WebApp API работает',
    timestamp: new Date().toISOString()
  })
}
