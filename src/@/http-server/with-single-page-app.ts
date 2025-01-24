import path from 'node:path'
import { IFileSystem } from '../file-system'
import { fileExtensionToContentType } from './content-type'
import { IHttpServer } from './interface'

export type Config = {
  httpServer: IHttpServer
  fileSystem: IFileSystem
  directory: string
  indexFile: string
  toExtname?: (filePath: string) => string
  toFilePath?: (pathname: string) => string
  toHeaders?: (filePath: string) => Record<string, string>
}
export const withSinglePageApp = (config: Config) => {
  const toExtname = config.toExtname ?? path.extname
  const toFilePath = config.toFilePath ?? ((pathname) => pathname)
  const toHeaders: (filePath: string) => Record<string, string> = config.toHeaders ?? (() => ({}))

  config.httpServer.registerRespond(async (req) => {
    try {
      const url = new URL(req.url)
      const pathname = decodeURIComponent(url.pathname)
      let filePath = toFilePath(path.join(config.directory, pathname === '/' ? config.indexFile : pathname))

      let file: ReadableStream<ArrayBufferView | ArrayBufferLike>
      if (await config.fileSystem.exists(filePath)) {
        file = await config.fileSystem.read(filePath)
      } else {
        filePath = toFilePath(path.join(config.directory, config.indexFile))
        file = await config.fileSystem.read(filePath)
      }

      const ext = toExtname(filePath)
      const contentType = fileExtensionToContentType(ext)
      const headers = toHeaders(filePath)
      headers['Content-Type'] = contentType
      return new Response(file, {
        headers,
        status: 200,
      })
    } catch (e) {
      return new Response(`Backend Error: ${String(e)}`, { status: 500 })
    }
  })
}
