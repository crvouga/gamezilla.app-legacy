export type IFileSystem = {
  exists: (path: string) => Promise<boolean>
  read: (path: string) => Promise<ReadableStream<ArrayBufferView | ArrayBufferLike>>
  listDirectory: (path: string) => Promise<string[]>
  getFileInfo: (path: string) => Promise<{
    isDirectory: () => boolean
  }>
}
