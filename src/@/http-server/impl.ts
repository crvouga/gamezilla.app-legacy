import { type ILogger } from '~/@/logger'
import { HttpServerBun } from './impl-bun'
import { HttpServerNode } from './impl-node'

type Config =
  | {
      t: 'bun'
      logger: ILogger
    }
  | {
      t: 'node'
      logger: ILogger
    }

export const HttpServer = (config: Config) => {
  const logger = config.logger.child(['backend'])
  switch (config.t) {
    case 'bun': {
      return HttpServerBun<unknown>({ ...config, logger })
    }

    case 'node': {
      return HttpServerNode({ ...config, logger })
    }
  }
}

export type HttpServer = ReturnType<typeof HttpServer>
