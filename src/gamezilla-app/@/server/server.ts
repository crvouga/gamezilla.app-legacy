import { Posix, Sub } from '../core'

export type HttpRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'CONNECT' | 'TRACE'

export type HttpRequest = {
  method: HttpRequestMethod
  cookies: Record<string, string>
  pathname: string
  headers: Record<string, string>
  body: string | null
}

export type HttpResponse = {
  status: number
  headers: Record<string, string>
  body: string | null
}

export type HttpHandler = (request: HttpRequest) => Promise<HttpResponse | null | undefined>

export type ServerEvent =
  | {
      t: 'server/started'
      ipAddress: string
      port: number
      startedAt: Posix
    }
  | {
      t: 'server/stopping'
      stoppedAt: Posix
    }

export type IServer = {
  start: (port: number) => Promise<void>
  serveSinglePageApp: (input: { directory: string; indexFile: string }) => void
  registerHandler: (handler: HttpHandler) => void
  events: Sub<ServerEvent>
}

export const stringToHttpRequestMethod = (input: string): HttpRequestMethod => {
  const cleaned = input.trim().toUpperCase()
  if (cleaned.includes('GET')) {
    return 'GET'
  }

  if (cleaned.includes('POST')) {
    return 'POST'
  }

  if (cleaned.includes('PUT')) {
    return 'PUT'
  }

  if (cleaned.includes('PATCH')) {
    return 'PATCH'
  }

  if (cleaned.includes('DELETE')) {
    return 'DELETE'
  }

  if (cleaned.includes('OPTIONS')) {
    return 'OPTIONS'
  }

  if (cleaned.includes('HEAD')) {
    return 'HEAD'
  }

  if (cleaned.includes('CONNECT')) {
    return 'CONNECT'
  }

  if (cleaned.includes('TRACE')) {
    return 'TRACE'
  }

  throw new Error(`Unknown method: ${input}`)
}

export const fileExtensionToContentType = (ext: string) => {
  switch (ext) {
    case '.html':
      return 'text/html'
    case '.css':
      return 'text/css'
    case '.js':
      return 'application/javascript'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    case '.ico':
      return 'image/x-icon'
    case '.json':
      return 'application/json'
    case '.txt':
      return 'text/plain'
    default:
      return 'application/octet-stream'
  }
}
