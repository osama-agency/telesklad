import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Рабочий бэкенд администратор
    if (email === 'go@osama.agency' && password === 'sfera13') {
      return NextResponse.json({
        id: 'admin_user',
        name: 'Root Admin',
        email: 'go@osama.agency',
        role: 'administrator'
      })
    }

    // Демо пользователь для тестирования
    if (email === 'demo@demo.com' && password === 'demo123') {
      return NextResponse.json({
        id: 'demo_user',
        name: 'Демо пользователь',
        email: 'demo@demo.com',
        role: 'user'
      })
    }

    // Дополнительный тестовый пользователь
    if (email === 'user@site.com' && password === '123456') {
      return NextResponse.json({
        id: 'test_user',
        name: 'Тестовый пользователь',
        email: 'user@site.com',
        role: 'user'
      })
    }

    return NextResponse.json(
      { error: 'Неверные учетные данные' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login API error:', error)

    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
