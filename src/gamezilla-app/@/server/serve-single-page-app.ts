import path from 'node:path'
import { IFileSystem } from '../file-system'
import { IServer } from './server'
import { fileExtensionToContentType } from './content-type'

export type Config = {
  server: IServer
  fileSystem: IFileSystem
  directory: string
  indexFile: string
}

export const withSinglePageApp = (config: Config) => {
  config.server.registerHandler(async (req) => {
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
  })
}
