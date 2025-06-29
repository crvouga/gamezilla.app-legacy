import * as ImplNode from './impl-node'
import * as ImplNoop from './impl-noop'
import { ICompress } from './interface'

export type Config = ImplNode.Config | ImplNoop.Config

export const Compress = (config: Config): ICompress => {
  switch (config.t) {
    case 'node': {
      return ImplNode.Compress(config)
    }
    case 'noop': {
      return ImplNoop.Compress(config)
    }
  }
}
