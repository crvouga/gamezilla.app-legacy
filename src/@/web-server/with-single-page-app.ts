import path from 'node:path'
import { ICompress } from '../compress'
import { IFileSystem } from '../file-system'
import { fileExtensionToContentType } from './content-type'
import { IWebServer } from './interface'

export type Config = {
  webServer: IWebServer
  fileSystem: IFileSystem
  compress: ICompress
  directory: string
  indexFile: string
}

export const withSinglePageApp = (config: Config) => {
  const respond = async (req: Request): Promise<Response> => {
    try {
      const url = new URL(req.url)

      const pathname = decodeURIComponent(url.pathname)
      const filePath = path.join(config.directory, pathname === '/' ? config.indexFile : pathname)
      const ext = path.extname(filePath)
      const contentType = fileExtensionToContentType(ext)

      const doesExist = await config.fileSystem.exists(filePath)

      if (!doesExist) {
        const filePathIndex = path.join(config.directory, config.indexFile)
        const extIndex = path.extname(filePathIndex)
        const contentTypeIndex = fileExtensionToContentType(extIndex)
        const fileIndex = await config.fileSystem.read(filePathIndex)
        return new Response(fileIndex, {
          headers: {
            'Content-Type': contentTypeIndex
          },
          status: 200
        })
      }

      const file = await config.fileSystem.read(filePath)
      return new Response(file, {
        headers: {
          'Content-Type': contentType
        },
        status: 200
      })
    } catch (e) {
      return new Response(`Server Error. ${String(e)}`, {
        status: 500
      })
    }
  }

  config.webServer.registerHandler(async (req) => {
    const response = await respond(req)
    return config.compress.gzipResponse(response)
  })
}
