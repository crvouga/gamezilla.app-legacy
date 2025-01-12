import { Logger } from '~/@/logger'
import { WebBackend } from '~/@/web-backend'
import { SERVER_PORT } from '~/config/backend'
import { LoadBalancer } from '~/load-balancer'

const main = async () => {
  const logger = Logger({
    t: 'console',
  })

  const backend = WebBackend({
    t: 'bun',
    logger,
  })

  const ctx = await LoadBalancer.initCtx({
    logger,
  })

  backend.registerHandler((request) => {
    logger.info(`${request.method} ${request.url}`)
    return LoadBalancer.respond(ctx, request)
  })

  if (!SERVER_PORT) {
    throw new Error('SERVER_PORT is not set')
  }

  await backend.start(SERVER_PORT)

  logger.info('Load balancer started')
}

main()
