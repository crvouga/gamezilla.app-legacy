export type IFileSystem = {
  exists: (path: string) => Promise<boolean>
  read: (path: string) => Promise<ReadableStream<unknown>>
}
