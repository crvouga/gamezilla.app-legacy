import { ICorsPolicy } from './interface'

export type ImplAllowList = {
  t: 'allow-list'
  allowList: string[]
}

const init = (config: ImplAllowList): ICorsPolicy => {
  return {
    updateResponse(response, request) {
      const origin = config.allowList.find((origin) => request.headers.get('Origin')?.includes(origin)) ?? null
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set(
        'Access-Control-Allow-Headers',
        response.headers.get('Access-Control-Request-Headers') ?? 'Content-Type, Authorization',
      )
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')

      if (request.method === 'OPTIONS') {
        response.headers.set('Access-Control-Max-Age', '3600')
      }
    },
  }
}

export const ImplAllowList = {
  init,
}
