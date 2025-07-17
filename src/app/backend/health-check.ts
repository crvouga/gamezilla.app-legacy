import { IHttpServer } from '~/@/http-server'
import { AppBackendCtxBase } from '../@/backend/ctx'

const registerRespond = (config: { httpServer: IHttpServer; ctx: AppBackendCtxBase }) => {
  config.httpServer.registerRespond((request) => {
    if (request.url.endsWith('/health')) {
      return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })
    }
    return null
  })
}

export const HealthCheckBackend = {
  registerRespond,
}
