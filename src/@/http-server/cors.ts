export const allowCORS = (input: { request: Request; response: Response }) => {
  let origin: string = '*'
  try {
    origin = new URL(input.request.headers.get('Origin') ?? '').toString()
  } catch (error) {
    origin = '*'
  }

  const headers = new Headers(input.response.headers)
  headers.set('Access-Control-Allow-Origin', origin)
  // headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, TRACE, CONNECT')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

  if (input.request.method === 'OPTIONS') {
    headers.set('Access-Control-Max-Age', '3600')

    return new Response(input.response.body, { status: 204, statusText: 'No Content', headers })
  }

  return new Response(input.response.body, {
    status: input.response.status,
    statusText: input.response.statusText,
    headers,
  })
}
