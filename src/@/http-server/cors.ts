export const allowCORS = (input: { request: Request; response: Response }) => {
  const origin = input.request.headers.get('Origin')
  if (!origin) return input.response

  const headers = new Headers(input.response.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')
  headers.set(
    'Access-Control-Allow-Headers',
    input.request.headers.get('Access-Control-Request-Headers') ?? 'Content-Type, Authorization',
  )

  if (input.request.method === 'OPTIONS') {
    headers.set('Access-Control-Max-Age', '3600')
    return new Response(null, { status: 204, headers })
  }

  return new Response(input.response.body, {
    status: input.response.status,
    statusText: input.response.statusText,
    headers,
  })
}
