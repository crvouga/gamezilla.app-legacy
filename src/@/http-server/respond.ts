import { Middleware, Respond } from './interface'

export const createRespond = (config: { server: unknown; middlewares: Middleware[]; responds: Respond[] }) => {
  const respond = async (request: Request): Promise<Response> => {
    for (const middleware of config.middlewares) {
      const response = await middleware(request, respondMain)
      if (response) {
        return response
      }
    }
    return respondMain(request)
  }

  const respondMain = async (request: Request): Promise<Response> => {
    try {
      for (const respond of config.responds) {
        const response = await respond(request, config.server)

        if (response) {
          return response
        }
      }

      return new Response('Not found', { status: 404 })
    } catch (error) {
      return new Response('Internal error', { status: 500 })
    }
  }

  return respond
}
