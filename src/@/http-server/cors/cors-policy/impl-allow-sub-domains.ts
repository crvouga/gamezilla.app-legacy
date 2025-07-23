import { ILogger } from '~/@/logger'
import { ICorsPolicy } from './interface'
import { normalizeDomain } from './normalize-domain'

export type ImplAllowSubDomains = {
  t: 'allow-sub-domains'
  /**
   * List of domains that are allowed to access the server.
   */
  allowedDomains: string[]
  /**
   * If true, the server's domain is also allowed to access the server.
   */
  allowRequestHostDomain: boolean

  logger: ILogger
}

const init = (config: ImplAllowSubDomains): ICorsPolicy => {
  const defaultLogger = config.logger.child(['cors', 'allow-sub-domains'])
  defaultLogger.debug('Initializing CORS policy', {
    allowedDomains: config.allowedDomains,
    allowServerDomain: config.allowRequestHostDomain,
  })

  return {
    map(response, request, maybeLogger) {
      const logger = maybeLogger ?? defaultLogger
      logger.debug('Processing CORS request')

      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      })
      logger.debug('Created new response object')

      const origin = request.headers.get('Origin')
      if (!origin) {
        logger.debug('No origin header found in request')
        return newResponse
      }

      try {
        const originDomain = normalizeDomain(origin)
        logger.debug('Processing request', { origin, originDomain })

        logger.debug('Checking against allowed domains', { allowedDomains: config.allowedDomains })
        const isAllowed = config.allowedDomains.some((domain) => {
          const normalizedDomain = normalizeDomain(domain)
          const matches = originDomain === normalizedDomain

          logger.debug('Checking domain match', { domain, normalizedDomain, matches })
          return matches
        })

        logger.debug('Checking if origin matches server host')
        const serverHost = request.headers.get('Host')
        const normalizedServerHost = normalizeDomain(serverHost)

        logger.debug('Checking server domain match', {
          serverHost,
          normalizedServerHost,
        })

        const isSameAsServer = config.allowRequestHostDomain && originDomain === normalizedServerHost
        logger.debug('Server host check result', { serverHost: normalizedServerHost, isSameAsServer })

        if (isAllowed || isSameAsServer) {
          logger.debug('Origin allowed, setting CORS headers', { origin })
          newResponse.headers.set('Access-Control-Allow-Origin', origin)
          newResponse.headers.set('Access-Control-Allow-Credentials', 'true')
          newResponse.headers.set(
            'Access-Control-Allow-Headers',
            response.headers.get('Access-Control-Request-Headers') ?? 'Content-Type, Authorization',
          )
          newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD')

          if (request.method === 'OPTIONS') {
            logger.debug('Handling OPTIONS request')
            newResponse.headers.set('Access-Control-Max-Age', '3600')
            return new Response(null, {
              status: 204,
              headers: newResponse.headers,
            })
          }
        } else {
          logger.debug('Origin not allowed', { origin, isAllowed, isSameAsServer })
        }
      } catch (error) {
        logger.error('Error processing CORS request', { error })
        // Invalid Origin, do nothing
      }

      return newResponse
    },
  }
}

export const ImplAllowSubDomains = {
  init,
}
