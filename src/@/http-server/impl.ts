import * as ImplNode from './impl-node'
import * as ImplNoop from './impl-noop'

export type Config = ImplNode.Config | ImplNoop.Config

const init = (config: Config) => {
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

export const HttpServer = {
  init,
}
