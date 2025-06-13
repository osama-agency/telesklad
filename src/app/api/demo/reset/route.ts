import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    // Разрешаем сброс данных как демо пользователю, так и при выходе из системы
    if (session?.user?.email !== 'demo@demo.com' && session?.user?.email) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    // Сбрасываем все демо данные через PATCH endpoints
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3010'
    const endpoints = [
      '/api/demo/products',
      '/api/demo/orders',
      '/api/demo/expenses',
      '/api/demo/purchases'
    ]

    const resetPromises = endpoints.map(endpoint =>
      fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.error(`Ошибка сброса ${endpoint}:`, error)
        return null
      })
    )

    await Promise.all(resetPromises)

    return NextResponse.json({
      success: true,
      message: 'Все демо данные успешно сброшены'
    })

  } catch (error) {
    console.error('Ошибка при сбросе демо данных:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
