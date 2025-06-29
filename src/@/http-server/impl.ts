import * as ImplNode from './impl-node'
import * as ImplNoop from './impl-noop'

export type Config = ImplNode.Config | ImplNoop.Config

export const HttpServer = (config: Config) => {
  const logger = config.logger.child(['backend'])
  switch (config.t) {
    case 'node': {
      return ImplNode.HttpServer({ ...config, logger })
    }

    case 'noop': {
      return ImplNoop.HttpServer({ ...config, logger })
    }
  }
}
