import { ICorsPolicy } from './interface'

export type ImplAllowList = {
  t: 'allow-list'
  allowList: string[]
}

const init = (config: ImplAllowList): ICorsPolicy => {
  return {
    map(response, request) {
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      })

      const origin = request.headers.get('Origin')
      const isAllowed = origin && config.allowList.some((allowed) => allowed === origin.replace(/^https?:\/\//, ''))

      if (isAllowed) {
        const allowedOrigin = config.allowList.find((allowed) => allowed === origin.replace(/^https?:\/\//, ''))!
        newResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin)
        newResponse.headers.set('Access-Control-Allow-Credentials', 'true')
        newResponse.headers.set(
          'Access-Control-Allow-Headers',
          response.headers.get('Access-Control-Request-Headers') ?? 'Content-Type, Authorization',
        )
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')

        if (request.method === 'OPTIONS') {
          newResponse.headers.set('Access-Control-Max-Age', '3600')
          return new Response(null, {
            status: 204,
            headers: newResponse.headers,
          })
        }
      }

      return newResponse
    },
  }
}

export const ImplAllowList = {
  init,
}
