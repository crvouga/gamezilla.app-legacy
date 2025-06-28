import { type ILogger } from '~/@/logger'
import { HttpServerBun } from './impl-bun'
import { HttpServerNode } from './impl-node'
import { HttpServerNoop } from './impl-noop'

type Config =
  | {
      t: 'bun'
      logger: ILogger
    }
  | {
      t: 'node'
      logger: ILogger
    }
  | {
      t: 'noop'
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

    case 'noop': {
      return HttpServerNoop({ ...config, logger })
    }
  }
}

export type HttpServer = ReturnType<typeof HttpServer>
