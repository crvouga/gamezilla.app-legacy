import { IHttpServer } from '~/@/http-server'
import { IFileSystem } from '../file-system'
import { isErr } from '../result'
import { extToContentType } from './ext-to-content-type'

const registerRespond = (config: {
  httpServer: IHttpServer
  directory: string
  indexFilename: string
  fs: IFileSystem
}) => {
  config.httpServer.registerRespond(async (request) => {
    const filePath = new URL(request.url).pathname.slice(1)

    const existsResult = await config.fs.exists(filePath)
    if (!isErr(existsResult) && existsResult.value) {
      const readResult = await config.fs.read(filePath)
      if (isErr(readResult)) {
        return new Response('Error reading file', { status: 500 })
      }
      const file = readResult.value
      const contentType = extToContentType(filePath)
      return new Response(file, { headers: { 'Content-Type': contentType } })
    }

    const indexPath = `${config.directory}/${config.indexFilename}`
    const indexReadResult = await config.fs.read(indexPath)
    if (isErr(indexReadResult)) {
      return new Response('Error reading index file', { status: 500 })
    }
    const indexContent = indexReadResult.value
    const indexContentType = extToContentType(config.indexFilename)
    return new Response(indexContent, { headers: { 'Content-Type': indexContentType } })
  })
}

export const SinglePageApp = {
  registerRespond,
}
