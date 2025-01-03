import * as ImplBun from './impl-bun'
import * as ImplNoop from './impl-noop'
import { ICompress } from './interface'

export type Config = ImplBun.Config | ImplNoop.Config

export const Compress = (config: Config): ICompress => {
  switch (config.t) {
    case 'bun': {
      return ImplBun.Compress(config)
    }
    case 'noop': {
      return ImplNoop.Compress(config)
    }
  }
}
