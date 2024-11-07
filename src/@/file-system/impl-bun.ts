import { IFileSystem } from './interface'

export type Config = {
  t: 'bun'
}

export const FileSystem = (_config: Config): IFileSystem => {
  return {
    async exists(path) {
      const file = Bun.file(path)
      return file.exists()
    },

    async read(path) {
      const file = Bun.file(path)
      return file.stream()
    }
  }
}
