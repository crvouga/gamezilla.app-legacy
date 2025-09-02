import { IHttpServer } from '~/@/http-server'
import { IFileSystem } from '../file-system'
import { isErr } from '../result'
import { extToContentType } from './ext-to-content-type'
import { ILogger } from '../logger'
import { TraceIdHttp } from '../wire/trace-id-http'

const registerRespond = (config: {
  httpServer: IHttpServer
  directory: string
  indexFilename: string
  fs: IFileSystem
  logger: ILogger
}) => {
  const logger_ = config.logger.child(['single-page-app'])
  logger_.debug('Registering single page app respond handler')

  config.httpServer.registerRespond(async (request) => {
    const traceId = TraceIdHttp.fromRequest(request)
    const logger = logger_.child([traceId])
    const filePath = new URL(request.url).pathname.slice(1)
    logger.debug(`Handling request for path: ${filePath}`)

    const existsResult = await config.fs.exists(filePath)
    if (!isErr(existsResult) && existsResult.value) {
      logger.debug(`File exists at path: ${filePath}`)
      const readResult = await config.fs.read(filePath)
      if (isErr(readResult)) {
        logger.debug(`Error reading file at path: ${filePath}`, readResult.error)
        return new Response('Error reading file', { status: 500 })
      }
      const file = readResult.value
      const contentType = extToContentType(filePath)
      logger.debug(`Serving file with content type: ${contentType}`)
      return new Response(file, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': 'inline',
        },
      })
    }

    logger.debug(`File not found at "${filePath}", serving index file`)
    const indexPath = `${config.directory}/${config.indexFilename}`
    const indexReadResult = await config.fs.read(indexPath)
    if (isErr(indexReadResult)) {
      logger.debug(`Error reading index file at path: ${indexPath}`, indexReadResult.error)
      return new Response('Error reading index file', { status: 500 })
    }
    const indexContent = indexReadResult.value
    const indexExt = config.indexFilename.split('.').pop() ?? 'html'
    const indexContentType = extToContentType(indexExt)
    logger.debug(`Serving index file "${config.indexFilename}" with content type: ${indexContentType}`)
    return new Response(indexContent, {
      headers: {
        'Content-Type': indexContentType,
        'Content-Disposition': 'inline',
      },
    })
  })
}

export const SinglePageApp = {
  registerRespond,
}
