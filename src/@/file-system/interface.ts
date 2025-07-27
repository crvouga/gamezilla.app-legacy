export type IFileSystem = {
  exists: (path: string) => Promise<boolean>
  read: (path: string) => Promise<ReadableStream<ArrayBufferView | ArrayBufferLike>>
  write: (path: string, data: string | Buffer) => Promise<void>
  delete: (path: string) => Promise<void>
  listDirectory: (path: string) => Promise<string[]>
  getFileInfo: (path: string) => Promise<{
    isDirectory: () => boolean
  }>
}
