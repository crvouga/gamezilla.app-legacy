import { ILogger } from '~/@/logger'
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
  logger: ILogger
}

const init = (config: ImplAllowSubDomains): ICorsPolicy => {
  const defaultLogger = config.logger.child(['cors', 'allow-sub-domains'])

  return {
    map(response, request, maybeLogger) {
      const logger = maybeLogger ?? defaultLogger

      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      })

      const origin = request.headers.get('Origin')
      if (!origin) {
        logger.debug('no origin header found')
        return newResponse
      }

      try {
        const originUrl = new URL(origin)
        const originHost = originUrl.hostname // e.g. sub.example.com
        logger.debug('processing request', { origin, originHost })

        // Check against allowedDomains
        const isAllowed = config.allowedDomains.some((domain) => {
          // Strip protocol and port if needed
          const cleanDomain = domain.replace(/^https?:\/\//, '').split(':')[0]
          const matches =
            originHost === cleanDomain || // exact match
            originHost.endsWith(`.${cleanDomain}`) || // subdomain match
            cleanDomain?.endsWith(`.${originHost}`) // parent domain match

          logger.debug('checking domain', { domain, cleanDomain, matches })
          return matches
        })

        // Check if origin is same as server's host
        const serverHost = request.headers.get('Host')?.split(':')[0] ?? ''
        const isSameAsServer = config.allowServerDomain && originHost === serverHost
        logger.debug('checking server host', { serverHost, isSameAsServer })

        if (isAllowed || isSameAsServer) {
          logger.debug('origin allowed, setting CORS headers')
          newResponse.headers.set('Access-Control-Allow-Origin', origin)
          newResponse.headers.set('Access-Control-Allow-Credentials', 'true')
          newResponse.headers.set(
            'Access-Control-Allow-Headers',
            response.headers.get('Access-Control-Request-Headers') ?? 'Content-Type, Authorization',
          )
          newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')

          if (request.method === 'OPTIONS') {
            logger.debug('handling OPTIONS request')
            newResponse.headers.set('Access-Control-Max-Age', '3600')
            return new Response(null, {
              status: 204,
              headers: newResponse.headers,
            })
          }
        } else {
          logger.debug('origin not allowed')
        }
      } catch (error) {
        logger.debug('invalid origin', { error })
        // Invalid Origin, do nothing
      }

      return newResponse
    },
  }
}

export const ImplAllowSubDomains = {
  init,
}
