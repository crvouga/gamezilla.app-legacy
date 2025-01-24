import { IHttpServer } from '~/@/http-server/interface'

const registerRespond = (config: { httpServer: IHttpServer }) => {
  config.httpServer.registerRespond((request: Request) => {
    switch (new URL(request.url).pathname) {
      case '/health': {
        return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })
      }
      default: {
        return null
      }
    }
  })
}

export const HealthCheck = {
  registerRespond,
}
