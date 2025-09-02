import { IHttpServer } from '~/@/http-server'
import { AppBackendCtxBase } from '../@/backend/ctx'

const respond = (_input: { ctx: AppBackendCtxBase; request: Request }) => {
  const message = 'Hello from gamezilla.app backend server'
  return new Response(message, { status: 200, headers: { 'Content-Type': 'text/plain' } })
}

const registerRespond = (config: { httpServer: IHttpServer; ctx: AppBackendCtxBase }) => {
  config.httpServer.registerRespond((request) => {
    return respond({ request, ctx: config.ctx })
  })
}

export const HelloBackend = {
  registerRespond,
}
