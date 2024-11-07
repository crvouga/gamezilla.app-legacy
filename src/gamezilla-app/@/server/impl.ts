import { Logger, type ILogger } from 'gamezilla-app/app/@/server/logger'
import { ServerBun } from './impl-bun'
import { ServerNode } from './impl-node'

type Config =
  | {
      t: 'bun'
      logger: ILogger
    }
  | {
      t: 'node'
      logger: ILogger
    }

export const Server = (config: Config) => {
  const logger = Logger.prefix('server', config.logger)
  switch (config.t) {
    case 'bun': {
      return ServerBun<unknown>({ ...config, logger })
    }

    case 'node': {
      return ServerNode({ ...config, logger })
    }
  }
}

export type ServerInstance = ReturnType<typeof Server>
