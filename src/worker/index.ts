/**
 * Gamezilla Cloudflare Worker
 * Minimal worker setup for API endpoints and edge computing
 */

interface Env {
  // Add your environment variables here
  // API_KEY?: string
  // DATABASE_URL?: string
}
export default {
  async fetch(request: Request, _env: Env, _ctx: any): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    // Health check endpoint
    if (path === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          worker: 'gamezilla-worker',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      )
    }

    // API endpoint example
    if (path === '/api/hello') {
      return new Response(
        JSON.stringify({
          message: 'Hello from Gamezilla Worker!',
          method: request.method,
          url: request.url,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      )
    }

    // 404 for unmatched routes
    return new Response(
      JSON.stringify({
        error: 'Not Found',
        path: path,
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )
  },
}
