import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      baseUrl: baseUrl,
      nextauth_url: process.env.NEXTAUTH_URL,
      api_url: process.env.API_URL,
      routes: {
        nextauth: `${baseUrl}/api/auth/signin`,
        login: `${baseUrl}/api/login`,
        health: `${baseUrl}/api/health-auth`
      },
      message: 'NextAuth API routes diagnostic'
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
