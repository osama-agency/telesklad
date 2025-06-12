const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3011'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/expenses?${searchParams.toString()}`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()

      if (data.success && data.data && data.data.expenses) {
        data.data.expenses = data.data.expenses.map((expense: any) => ({
          ...expense,
          description: expense.comment || '',
          amount: parseFloat(expense.amount) || 0
        }))
      }

      return Response.json(data, { status: response.status })
    }

    // Backend недоступен
    return Response.json({
      success: true,
      data: {
        expenses: [],
        total: 0,
        message: 'Backend сервер временно недоступен'
      }
    })

  } catch (error) {
    console.error('Error proxying GET /api/expenses:', error)

    return Response.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const backendUrl = `${BACKEND_URL}/api/expenses`

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Error proxying POST /api/expenses:', error)
    return Response.json(
      { success: false, error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
