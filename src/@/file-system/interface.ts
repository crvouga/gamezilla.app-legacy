import { Result } from '../result'

export type IFileSystem = {
  exists: (path: string) => Promise<Result<string, boolean>>
  read: (path: string) => Promise<Result<string, ReadableStream<ArrayBufferView | ArrayBufferLike>>>
  write: (path: string, data: string | Buffer) => Promise<Result<string, void>>
  delete: (path: string) => Promise<Result<string, void>>
  listDirectory: (path: string) => Promise<Result<string, string[]>>
  getFileInfo: (path: string) => Promise<
    Result<
      string,
      {
        isDirectory: () => boolean
      }
    >
  >
}
