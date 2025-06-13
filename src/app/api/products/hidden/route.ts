import { NextResponse } from 'next/server'

import { requireAdminAccess } from '@/lib/auth-helpers'

// GET /api/products/hidden - получить количество скрытых товаров
export async function GET() {
  // Проверяем права администратора
  const accessDenied = await requireAdminAccess()

  if (accessDenied) {
    return accessDenied
  }
  try {
    // Пробуем получить данные с backend сервера
    const response = await fetch('http://localhost:3011/api/products?hidden=true', {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      count: data.data ? data.data.length : 0
    })
  } catch (error) {
    console.error('Error fetching hidden products:', error)

    // Если backend недоступен, возвращаем 0
    return NextResponse.json({
      success: true,
      count: 0
    })
  }
}
