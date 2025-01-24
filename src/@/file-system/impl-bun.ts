import { IFileSystem } from './interface'
import { readdir } from 'node:fs/promises'

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
    },

    async listDirectory(path) {
      const entries = await readdir(path)
      return Array.from(entries)
    },

    async getFileInfo(path) {
      const file = Bun.file(path)
      const stat = await file.stat()
      return {
        isDirectory: () => stat.isDirectory(),
      }
    },
  }
}
