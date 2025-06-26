export async function POST(request: Request) {
  try {
    const { query, count = 10, locations, locations_boost, from_bound, to_bound, restrict_value, ...otherOptions } = await request.json();
    
    if (!query || query.trim().length < 2) {
      return Response.json({ suggestions: [] });
    }

    const dadataToken = process.env.DADATA_TOKEN || process.env.DADATA_API_KEY;
    if (!dadataToken) {
      console.error('DADATA_TOKEN not configured');
      return Response.json({ error: 'Service unavailable - API key not configured' }, { status: 503 });
    }

    // Формируем тело запроса с учетом всех параметров
    const requestBody: any = {
      query: query.trim(),
      count: Math.min(count, 10)
    };

    // Добавляем опциональные параметры для фильтрации
    if (locations) {
      requestBody.locations = locations;
    }
    if (locations_boost) {
      requestBody.locations_boost = locations_boost;
    }
    if (from_bound) {
      requestBody.from_bound = from_bound;
    }
    if (to_bound) {
      requestBody.to_bound = to_bound;
    }
    if (restrict_value !== undefined) {
      requestBody.restrict_value = restrict_value;
    }

    // Добавляем любые другие опции
    Object.assign(requestBody, otherOptions);

    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${dadataToken}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('DaData API error:', response.status, responseText);
      return Response.json({ 
        error: 'DaData API error', 
        status: response.status,
        message: responseText 
      }, { status: 503 });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse DaData response:', responseText);
      return Response.json({ error: 'Invalid response from DaData' }, { status: 500 });
    }
    
    return Response.json(data);
    
  } catch (error) {
    console.error('DaData address API error:', error);
    return Response.json({ 
      error: 'Service unavailable', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 