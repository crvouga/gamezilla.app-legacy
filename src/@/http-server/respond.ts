import { TraceId } from '../wire/trace-id'
import { Middleware, Respond } from './interface'

export const createRespond = (middlewares: Middleware[], responds: Respond[]): Respond => {
  const respond: Respond = async (request: Request, server: unknown, traceId: TraceId) => {
    let next = (request: Request) => respondMain(request, server, traceId)
    for (const middleware of middlewares.reverse()) {
      const current = next
      next = (request) => middleware(request, current)
    }
    return next(request)
  }

  const respondMain: Respond = async (request: Request, server: unknown, traceId: TraceId) => {
    try {
      for (const respond of responds) {
        const response = await respond(request, server, traceId)

        if (response) {
          return response
        }
      }

      return new Response('Not found', { status: 404 })
    } catch (error) {
      console.error(error)
      return new Response('Internal error', { status: 500 })
    }
  }

  return respond
}
