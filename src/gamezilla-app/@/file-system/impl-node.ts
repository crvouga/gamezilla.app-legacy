import { promises as fs } from 'fs'
import { IFileSystem } from './interface'

export type Config = {
  t: 'node'
}

export const FileSystem = (_config: Config): IFileSystem => {
  return {
    async exists(path) {
      try {
        await fs.access(path)
        return true
      } catch {
        return false
      }
    },

    async read(path) {
      const fileContent = await fs.readFile(path)
      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(fileContent)
          controller.close()
        }
      })
      return readableStream
    }
  }
}
