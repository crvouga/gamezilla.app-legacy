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

export const withSinglePageApp = async (config: Config) => {
  const toExtname = config.toExtname ?? path.extname
  const toFilePath = config.toFilePath ?? ((pathname) => pathname)
  const toHeaders: (filePath: string) => Record<string, string> = config.toHeaders ?? (() => ({}))

  const registerFile = async (filePath: string) => {
    const relativePath = path.relative(config.directory, filePath)
    const file = await config.fileSystem.read(filePath)
    const ext = toExtname(filePath)
    const contentType = fileExtensionToContentType(ext)
    const headers = toHeaders(filePath)
    headers['Content-Type'] = contentType

    config.httpServer.registerStatic(
      relativePath,
      new Response(file, {
        headers,
        status: 200,
      }),
    )

    // Also register as index.html for SPA routing
    if (path.basename(filePath) === config.indexFile) {
      config.httpServer.registerStatic(
        '',
        new Response(file, {
          headers,
          status: 200,
        }),
      )
    }
  }

  const traverseDirectory = async (dirPath: string) => {
    const entries = await config.fileSystem.listDirectory(dirPath)

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry)
      const fileInfo = await config.fileSystem.getFileInfo(fullPath)

      if (fileInfo.isDirectory()) {
        await traverseDirectory(fullPath)
      } else {
        await registerFile(toFilePath(fullPath))
      }
    }
  }

  await traverseDirectory(config.directory)
}
