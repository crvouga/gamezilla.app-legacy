import { IFileSystem } from './interface'

export type ImplInMemory = {
  t: 'in-memory'
}

const init = (_config: ImplInMemory): IFileSystem => {
  const files = new Map<string, string | Buffer>()
  return {
    async exists(path) {
      try {
        return files.has(path)
      } catch {
        return false
      }
    },

    async write(path, data) {
      files.set(path, data)
    },

    async read(path) {
      const fileContent = files.get(path)
      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(fileContent!)
          controller.close()
        },
      })
      return readableStream
    },

    async listDirectory(_path) {
      return Array.from(files.keys())
    },

    async getFileInfo(_path) {
      return {
        isDirectory: () => false,
      }
    },
  }
}

export const ImplInMemory = {
  init,
}
