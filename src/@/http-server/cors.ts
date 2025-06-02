export const allowCORS = (request: Request, response: Response): Response => {
  const origin = request.headers.get('Origin')

  const headers = new Headers(response.headers)

  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set(
      'Access-Control-Allow-Headers',
      headers.get('Access-Control-Request-Headers') ?? 'Content-Type, Authorization',
    )
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
  }

  if (request.method === 'OPTIONS') {
    headers.set('Access-Control-Max-Age', '3600')
    return new Response(null, { status: 204, headers })
  }

  return new Response(response.body, { status: response.status, headers, statusText: response.statusText })
}
