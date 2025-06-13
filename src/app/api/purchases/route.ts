import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Если пользователь не авторизован или демо пользователь - перенаправляем на демо API
    if (!session || session?.user?.email === 'demo@demo.com') {
      const { searchParams } = new URL(request.url)
      const demoUrl = new URL('/api/demo/purchases', request.url)
      demoUrl.search = searchParams.toString()

      return fetch(demoUrl.toString(), {
        method: 'GET',
        headers: request.headers
      })
    }

    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const backendUrl = `http://localhost:3011/api/purchases${queryString ? `?${queryString}` : ''}`

    const response = await fetch(backendUrl)

    if (response.ok) {
      const data = await response.json()

      return NextResponse.json(data)
    }

    // Backend недоступен
    return NextResponse.json({
      success: true,
      data: {
        purchases: [],
        total: 0,
        message: 'Backend сервер временно недоступен'
      }
    })
  } catch (error) {
    console.error('Error proxying purchases request:', error)

    return NextResponse.json({
      success: false,
      error: 'Ошибка получения закупок'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Если пользователь не авторизован или демо пользователь - перенаправляем на демо API
    if (!session || session?.user?.email === 'demo@demo.com') {
      const body = await request.json()

      return fetch(new URL('/api/demo/purchases', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })
    }

    const body = await request.json()

    const response = await fetch('http://localhost:3011/api/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json({
      success: false,
      error: 'Ошибка создания закупки'
    }, { status: 500 })
  }
}
