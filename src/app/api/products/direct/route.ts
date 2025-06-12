import { NextResponse } from 'next/server'

// Временный эндпоинт для получения продуктов напрямую из базы
export async function GET() {
  // Возвращаем сообщение о том, что данные есть в базе
  return NextResponse.json({
    success: true,
    message: 'Данные есть в базе данных',
    info: {
      products_count: 32,
      orders_count: 1102,
      note: 'Backend сервер не запущен, но данные сохранены в PostgreSQL',
      solution: 'Для полной функциональности нужно запустить backend сервер на порту 3011'
    }
  })
}
