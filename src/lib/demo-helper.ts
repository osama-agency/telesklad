import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

export async function isDemoUser(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)

    return session?.user?.email === 'demo@demo.com'
  } catch (error) {
    console.error('Ошибка при проверке демо пользователя:', error)

    return false
  }
}

export async function resetAllDemoData(): Promise<void> {
  try {
    // Сбрасываем все демо данные через PATCH endpoints
    const endpoints = [
      '/api/demo/products',
      '/api/demo/orders',
      '/api/demo/expenses',
      '/api/demo/purchases'
    ]

    await Promise.all(
      endpoints.map(endpoint =>
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3010'}${endpoint}`, {
          method: 'PATCH'
        })
      )
    )
  } catch (error) {
    console.error('Ошибка при сбросе демо данных:', error)
  }
}
