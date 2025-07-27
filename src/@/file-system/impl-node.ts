import { promises as fs } from 'fs'
import { IFileSystem } from './interface'

export type ImplNode = {
  t: 'node'
}

const init = (_config: ImplNode): IFileSystem => {
  return {
    async exists(path) {
      try {
        await fs.access(path)
        return true
      } catch {
        return false
      }
    },

    async write(path, data) {
      await fs.writeFile(path, data)
    },

    async read(path) {
      const fileContent = await fs.readFile(path)
      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(fileContent)
          controller.close()
        },
      })
      return readableStream
    },

    async listDirectory(path) {
      return fs.readdir(path)
    },

    async getFileInfo(path) {
      const stats = await fs.stat(path)
      return {
        isDirectory: () => stats.isDirectory(),
      }
    },

    async delete(path) {
      await fs.rm(path)
    },
  }
}

export const ImplNode = {
  init,
}
