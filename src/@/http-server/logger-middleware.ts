import { ILogger } from '../logger'
import { Middleware } from './interface'

export const LoggerMiddleware =
  (config: { logger: ILogger }): Middleware =>
  async (request, next) => {
    const startTime = Date.now()
    const response = await next(request)
    const duration = Date.now() - startTime
    const status = response?.status || 404
    const statusText = response?.statusText || 'Not Found'
    const message = `${request.method} ${request.url} ${status} ${statusText} ${duration}ms`

    if (status >= 500) {
      config.logger.error(message)
    } else if (status >= 400) {
      config.logger.warn(message)
    } else {
      config.logger.info(message)
    }

    return response
  }
