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
    updateResponse(response, request) {
      const origin = request.headers.get('Origin')
      if (!origin) return

      try {
        const originUrl = new URL(origin)
        const originHost = originUrl.hostname // e.g. sub.example.com

        // Check against allowedDomains
        const isAllowed = config.allowedDomains.some((domain) => {
          // Strip protocol and port if needed
          const cleanDomain = domain.replace(/^https?:\/\//, '').split(':')[0]
          return (
            originHost === cleanDomain || // exact match
            originHost.endsWith(`.${cleanDomain}`) // subdomain match
          )
        })

        // Check if origin is same as server's host
        const serverHost = request.headers.get('Host')?.split(':')[0] ?? ''
        const isSameAsServer = config.allowServerDomain && originHost === serverHost

        if (isAllowed || isSameAsServer) {
          response.headers.set('Access-Control-Allow-Origin', origin)
          response.headers.set('Access-Control-Allow-Credentials', 'true')
          response.headers.set(
            'Access-Control-Allow-Headers',
            request.headers.get('Access-Control-Request-Headers') ?? 'Content-Type, Authorization',
          )
          response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')

          if (request.method === 'OPTIONS') {
            response.headers.set('Access-Control-Max-Age', '3600')
          }
        }
      } catch {
        // Invalid Origin, do nothing
      }
    },
  }
}

export const ImplAllowSubDomains = {
  init,
}
