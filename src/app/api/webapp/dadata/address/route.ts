export async function POST(request: Request) {
  try {
    const { query, count = 10 } = await request.json();
    
    if (!query || query.trim().length < 2) {
      return Response.json({ suggestions: [] });
    }

    const dadataToken = process.env.DADATA_API_KEY;
    if (!dadataToken) {
      console.error('DADATA_API_KEY not configured');
      return Response.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${dadataToken}`
      },
      body: JSON.stringify({
        query: query.trim(),
        count: Math.min(count, 10)
      })
    });

    if (!response.ok) {
      console.error('DaData API error:', response.status);
      return Response.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const data = await response.json();
    return Response.json(data);
    
  } catch (error) {
    console.error('DaData address API error:', error);
    return Response.json({ error: 'Service unavailable' }, { status: 500 });
  }
} 