export const allowCORS = (input: { request: Request; response: Response }) => {
  const rawOrigin = input.request.headers.get('Origin')
  const origin = !rawOrigin || rawOrigin === 'null' ? '*' : rawOrigin

  const headers = new Headers(input.response.headers)
  headers.set('Access-Control-Allow-Origin', origin)
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (input.request.method !== 'OPTIONS') {
    return new Response(input.response.body, {
      status: input.response.status,
      statusText: input.response.statusText,
      headers,
    })
  }

  headers.set('Access-Control-Max-Age', '3600')

  return new Response(input.response.body, {
    status: input.request.method === 'OPTIONS' ? 204 : input.response.status,
    statusText: input.request.method === 'OPTIONS' ? 'No Content' : input.response.statusText,
    headers,
  })
}
