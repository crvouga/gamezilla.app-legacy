import { Err, Ok } from '../result'
import { IFileSystem } from './interface'

export type ImplInMemory = {
  t: 'in-memory'
}

const init = (_config: ImplInMemory): IFileSystem => {
  const files = new Map<string, Uint8Array>()
  return {
    async exists(path) {
      try {
        return Ok(files.has(path))
      } catch {
        return Err('Failed to check if file exists')
      }
    },

    async write(path, data) {
      try {
        // Convert string or Buffer to Uint8Array for consistent storage
        const uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)
        files.set(path, uint8Array)
        return Ok(undefined)
      } catch (error) {
        return Err(`Failed to write file: ${String(error)}`)
      }
    },

    async read(path) {
      try {
        const fileContent = files.get(path)
        if (fileContent === undefined) {
          return Err(`File not found: ${path}`)
        }

        const readableStream = new ReadableStream({
          start(controller) {
            controller.enqueue(fileContent)
            controller.close()
          },
        })
        return Ok(readableStream)
      } catch (error) {
        return Err(`Failed to read file: ${String(error)}`)
      }
    },

    async listDirectory(_path) {
      try {
        // For in-memory, we can list all files regardless of path
        // since we don't have a real directory structure
        return Ok(Array.from(files.keys()))
      } catch (error) {
        return Err(`Failed to list directory: ${String(error)}`)
      }
    },

    async getFileInfo(_path) {
      try {
        return Ok({
          isDirectory: () => false,
        })
      } catch (error) {
        return Err(`Failed to get file info: ${String(error)}`)
      }
    },

    async delete(path) {
      try {
        files.delete(path)
        return Ok(undefined)
      } catch (error) {
        return Err(`Failed to delete file: ${String(error)}`)
      }
    },
  }
}

export const ImplInMemory = {
  init,
}
