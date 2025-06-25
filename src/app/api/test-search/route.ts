import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  try {
    // Тестируем поиск товаров
    const baseUrl = request.nextUrl.origin;
    const searchResponse = await fetch(`${baseUrl}/api/webapp/products/search?q=${encodeURIComponent(query)}&limit=5`);
    
    if (!searchResponse.ok) {
      throw new Error(`Search API failed: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    return NextResponse.json({
      success: true,
      query,
      results: searchData,
      message: `Search completed for query: "${query}"`
    });

  } catch (error) {
    console.error('❌ Test search failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test search',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 