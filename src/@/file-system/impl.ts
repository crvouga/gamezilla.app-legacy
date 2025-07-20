import { ImplNode } from './impl-node'
import { IFileSystem } from './interface'

export type FileSystem = ImplNode

const init = (config: FileSystem): IFileSystem => {
  switch (config.t) {
    case 'node': {
      return ImplNode.init(config)
    }
  }
}

export const FileSystem = {
  init,
}
