import * as ImplBun from './impl-bun'
import * as ImplNode from './impl-node'
import { IFileSystem } from './interface'

export type Config = ImplNode.Config | ImplBun.Config

export const FileSystem = (config: Config): IFileSystem => {
  switch (config.t) {
    case 'bun': {
      return ImplBun.FileSystem(config)
    }
    case 'node': {
      return ImplNode.FileSystem(config)
    }
  }
}
