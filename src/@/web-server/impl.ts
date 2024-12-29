import { Logger, type ILogger } from '~/@/logger'
import { WebServerBun } from './impl-bun'
import { WebServerNode } from './impl-node'

type Config =
  | {
      t: 'bun'
      logger: ILogger
    }
  | {
      t: 'node'
      logger: ILogger
    }

export const WebServer = (config: Config) => {
  const logger = Logger.prefix('server', config.logger)
  switch (config.t) {
    case 'bun': {
      return WebServerBun<unknown>({ ...config, logger })
    }

    case 'node': {
      return WebServerNode({ ...config, logger })
    }
  }
}

export type WebServer = ReturnType<typeof WebServer>
