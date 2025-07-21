import { ImplInMemory } from './impl-in-memory'
import { ImplNode } from './impl-node'
import { IFileSystem } from './interface'

export type FileSystem = ImplNode | ImplInMemory

const init = (config: FileSystem): IFileSystem => {
  switch (config.t) {
    case 'node': {
      return ImplNode.init(config)
    }
    case 'in-memory': {
      return ImplInMemory.init(config)
    }
  }
}

export const FileSystem = {
  init,
}
