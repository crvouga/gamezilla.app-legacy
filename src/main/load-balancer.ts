import { Logger } from '~/@/logger'
import { WebServer } from '~/@/web-server'
import { SERVER_PORT } from '~/config/server'
import { LoadBalancer } from '~/load-balancer'

const main = async () => {
  const logger = Logger({
    t: 'console',
  })

  const server = WebServer({
    t: 'bun',
    logger,
  })

  const ctx = await LoadBalancer.initCtx({
    logger,
  })

  server.registerHandler((request) => {
    logger.info(`${request.method} ${request.url}`)
    return LoadBalancer.respond(ctx, request)
  })

  await server.start(SERVER_PORT)

  logger.info('Load balancer started')
}

main()
