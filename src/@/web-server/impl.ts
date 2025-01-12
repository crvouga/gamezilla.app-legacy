import { Logger, type ILogger } from '~/@/logger'
import { WebBackendBun } from './impl-bun'
import { WebBackendNode } from './impl-node'

type Config =
  | {
      t: 'bun'
      logger: ILogger
    }
  | {
      t: 'node'
      logger: ILogger
    }

export const WebBackend = (config: Config) => {
  const logger = Logger.prefix('server', config.logger)
  switch (config.t) {
    case 'bun': {
      return WebBackendBun<unknown>({ ...config, logger })
    }

    case 'node': {
      return WebBackendNode({ ...config, logger })
    }
  }
}

export type WebBackend = ReturnType<typeof WebBackend>
