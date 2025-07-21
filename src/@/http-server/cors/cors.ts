import { Middleware } from '../interface'
import { ICorsPolicy } from './cors-policy/interface'

const middleware =
  (policy: ICorsPolicy): Middleware =>
  async (request, next) => {
    let response: Response | null | undefined = null
    try {
      response = await next(request)
    } catch (error) {
      console.error(error)
      response = new Response(null, { status: 500 })
    }

    if (response) {
      response = policy.map(response, request)
    }

    return response
  }

export const Cors = {
  middleware,
}
