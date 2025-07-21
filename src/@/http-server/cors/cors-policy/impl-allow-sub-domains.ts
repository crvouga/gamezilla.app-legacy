import { ICorsPolicy } from './interface'

export type ImplAllowSubDomains = {
  t: 'allow-sub-domains'
  /**
   * List of domains that are allowed to access the server.
   */
  allowedDomains: string[]
  /**
   * If true, the server's domain is also allowed to access the server.
   */
  allowServerDomain: boolean
}

const init = (config: ImplAllowSubDomains): ICorsPolicy => {
  return {
    map(response, request) {
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      })

      const origin = request.headers.get('Origin')
      if (!origin) return newResponse

      try {
        const originUrl = new URL(origin)
        const originHost = originUrl.hostname // e.g. sub.example.com

        // Check against allowedDomains
        const isAllowed = config.allowedDomains.some((domain) => {
          // Strip protocol and port if needed
          const cleanDomain = domain.replace(/^https?:\/\//, '').split(':')[0]
          return (
            originHost === cleanDomain || // exact match
            originHost.endsWith(`.${cleanDomain}`) || // subdomain match
            cleanDomain?.endsWith(`.${originHost}`) // parent domain match
          )
        })

        // Check if origin is same as server's host
        const serverHost = request.headers.get('Host')?.split(':')[0] ?? ''
        const isSameAsServer = config.allowServerDomain && originHost === serverHost

        if (isAllowed || isSameAsServer) {
          newResponse.headers.set('Access-Control-Allow-Origin', origin)
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
      } catch {
        // Invalid Origin, do nothing
      }

      return newResponse
    },
  }
}

export const ImplAllowSubDomains = {
  init,
}
