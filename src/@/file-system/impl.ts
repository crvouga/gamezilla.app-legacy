import * as ImplNode from './impl-node'
import { IFileSystem } from './interface'

export type Config = ImplNode.Config

export const FileSystem = (config: Config): IFileSystem => {
  switch (config.t) {
    case 'node': {
      return ImplNode.FileSystem(config)
    }
  }
}
