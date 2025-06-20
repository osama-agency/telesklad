export async function POST(request: Request) {
  try {
    const { query, count = 10, parts, gender } = await request.json();
    
    if (!query || query.trim().length < 2) {
      return Response.json({ suggestions: [] });
    }

    const dadataToken = process.env.DADATA_TOKEN || process.env.DADATA_API_KEY;
    if (!dadataToken) {
      console.error('DADATA_TOKEN not configured');
      return Response.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const requestBody: any = {
      query: query.trim(),
      count: Math.min(count, 10)
    };

    // Добавляем фильтры если указаны
    if (parts && Array.isArray(parts)) {
      requestBody.parts = parts;
    }
    
    if (gender && ['MALE', 'FEMALE', 'UNKNOWN'].includes(gender)) {
      requestBody.gender = gender;
    }

    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${dadataToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('DaData FIO API error:', response.status);
      return Response.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const data = await response.json();
    return Response.json(data);
    
  } catch (error) {
    console.error('DaData FIO API error:', error);
    return Response.json({ error: 'Service unavailable' }, { status: 500 });
  }
} 