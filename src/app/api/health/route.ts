// Health check endpoint
export async function GET() {
  try {
    // Log health check request
    console.log('[Health Check] Request received at', new Date().toISOString())

    // Check if backend is available
    let backendStatus = 'unknown'
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3011'
      const response = await fetch(`${backendUrl}/health`, {
        signal: AbortSignal.timeout(2000) // 2 second timeout
      })
      backendStatus = response.ok ? 'healthy' : 'unhealthy'
    } catch (error) {
      backendStatus = 'unreachable'
      console.log('[Health Check] Backend check failed:', error)
    }

    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'telesite-api',
      backend: backendStatus,
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '3000'
    }

    console.log('[Health Check] Response:', healthData)

    return Response.json(healthData, {
      status: 200
    })
  } catch (error) {
    console.error('[Health Check] Error:', error)
    return Response.json({
      status: 'error',
      message: 'Service unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 503
    })
  }
}
