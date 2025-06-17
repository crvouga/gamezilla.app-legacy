import { IHttpServer } from '~/@/http-server'
import { BackendRole } from '../@/backend/backend-role'
import { AppBackendCtxBase } from '../@/backend/ctx'

const respond = (input: { ctx: AppBackendCtxBase; request: Request }) => {
  const message = toHelloMessage(input.ctx.backendRole)
  return new Response(message, { status: 200, headers: { 'Content-Type': 'text/plain' } })
}

const toHelloMessage = (role: BackendRole): string => {
  switch (role) {
    case 'primary':
      return 'Hello from gamezilla.app primary backend'
    case 'edge':
      return 'Hello from gamezilla.app edge backend'
  }
}

const registerRespond = (config: { httpServer: IHttpServer; ctx: AppBackendCtxBase }) => {
  config.httpServer.registerRespond((request) => {
    return respond({ request, ctx: config.ctx })
  })
}

export const HelloBackend = {
  registerRespond,
}
