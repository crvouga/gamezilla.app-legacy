import type { ILogger } from 'gamezilla-app/app/@/server/logger'
import * as fs from 'node:fs'
import * as http from 'node:http'
import * as path from 'node:path'
import { fileExtensionToContentType, type HttpHandler, type HttpRequest, type IServer } from '../server'

const removeDuplicateSlashes = (input: string) => {
  return input.replace(/\/{2,}/g, '/')
}
export const ServerNode = (input: { logger: ILogger }) => {
  const httpServer = new http.Server()
  const handlers: HttpHandler[] = []
  const base: IServer = {
    async start(port) {
      try {
        await new Promise<void>((r) => httpServer.listen(port, r))
      } catch (error) {
        console.error('error', error)
      }

      input.logger.info(`Listening on port ${port}`)

      httpServer.on('request', async (req, res) => {
        const request: HttpRequest = {
          method:
            req.method === 'GET'
              ? 'GET'
              : req.method === 'POST'
              ? 'POST'
              : req.method === 'PUT'
              ? 'PUT'
              : req.method === 'PATCH'
              ? 'PATCH'
              : req.method === 'DELETE'
              ? 'DELETE'
              : req.method === 'OPTIONS'
              ? 'OPTIONS'
              : req.method === 'HEAD'
              ? 'HEAD'
              : req.method === 'CONNECT'
              ? 'CONNECT'
              : req.method === 'TRACE'
              ? 'TRACE'
              : 'GET',
          pathname: removeDuplicateSlashes(req.url ?? '/'),
          headers: req.headers as Record<string, string>,
          cookies:
            req.headers.cookie?.split(';').reduce<Record<string, string>>((acc, cookie) => {
              const [key, value] = cookie.split('=')
              if (key && value) {
                acc[key.trim()] = value.trim()
              }
              return acc
            }, {}) ?? {},
          body:
            req.method === 'POST' ||
            req.method === 'PUT' ||
            req.method === 'PATCH' ||
            req.method === 'DELETE' ||
            req.method === 'OPTIONS' ||
            req.method === 'HEAD' ||
            req.method === 'CONNECT' ||
            req.method === 'TRACE'
              ? await new Promise((resolve) => {
                  let body = ''
                  req.on('data', (chunk) => {
                    body += chunk
                  })
                  req.on('end', () => {
                    resolve(body)
                  })
                })
              : null
        }

        for (const handler of handlers) {
          const response = await handler(request)
          if (response) {
            res.writeHead(response.status, response.headers)
            res.end(response.body)
            return
          }
        }
      })
    },
    serveSinglePageApp(input) {
      serveSinglePageApp(httpServer)(input)
    },
    registerHandler(handler) {
      handlers.push(handler)
    }
  }
  return {
    ...base,
    httpServer,
    t: 'node'
  } as const
}

export type ServerNode = ReturnType<typeof ServerNode>

const serveSinglePageApp =
  (httpServer: http.Server): IServer['serveSinglePageApp'] =>
  (input) => {
    httpServer.on('request', (req, res) => {
      try {
        let filePath = path.join(input.directory, req.url === '/' ? input.indexFile : req.url ?? '')

        const ext = path.extname(filePath)

        if (!ext) {
          filePath = path.join(input.directory, input.indexFile)
        }

        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(404)
            res.end(`Not Found err=${err}`)
            return
          }

          const ext = path.extname(filePath)

          const contentType = fileExtensionToContentType(ext)

          res.writeHead(200, {
            'Content-Type': contentType
          })
          res.end(content, 'utf-8')
        })
      } catch (e) {
        res.writeHead(500)
        res.end(`Server Error. ${String(e)}`)
      }
    })
  }
