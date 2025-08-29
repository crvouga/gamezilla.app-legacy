import { ImplNode } from './impl-node'
import { ImplNoop } from './impl-noop'
import { IHttpServer } from './interface'

export type Config = ImplNode | ImplNoop

const init = (config: Config): IHttpServer => {
  const logger = config.logger.child(['http-server'])
  switch (config.t) {
    case 'node': {
      return ImplNode.init({ ...config, logger })
    }

    case 'noop': {
      return ImplNoop.init({ ...config, logger })
    }
  }
}

export const HttpServer = {
  init,
}
