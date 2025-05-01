import { allowCORS } from '~/@/http-server/cors'

import { IHttpServer } from '~/@/http-server'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { Base, Contract, Server } from '../types'
import { isErr } from '~/@/result'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'

export const registerRespond = <T extends Base>(registerInput: {
  httpServer: IHttpServer
  contract: T
  implementation: Server<T>
}) => {
  const handleRequest = async (requestInput: {
    contract: Contract<any>
    handlers: Server<any>
    path: string[]
    request: Request
    sessionId: SessionId
    clientSessionId: ClientSessionId
  }) => {
    const endpointName = requestInput.path[0]
    if (!endpointName) {
      return null
    }
    const endpointConfig = requestInput.contract[endpointName]
    const handler = requestInput.handlers[endpointName]

    if (!endpointConfig || !handler) {
      return null
    }

    if ('input' in endpointConfig && 'output' in endpointConfig && typeof handler === 'function') {
      // Leaf endpoint
      try {
        const requestData = await requestInput.request.json()
        const parsedInput = endpointConfig.input.parse(requestData)
        if (isErr(parsedInput)) {
          return new Response(JSON.stringify({ error: parsedInput.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const outputData = await handler(parsedInput.value, {
          sessionId: requestInput.sessionId,
          clientSessionId: requestInput.clientSessionId,
        })
        const parsedOutput = endpointConfig.output.parse(outputData)

        if (isErr(parsedOutput)) {
          return new Response(JSON.stringify({ error: parsedOutput.error }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify(parsedOutput.value), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 400 })
      }
    }

    return handleRequest({
      contract: endpointConfig as Contract<any>,
      handlers: handler as Server<any>,
      path: requestInput.path.slice(1),
      request: requestInput.request,
      sessionId: requestInput.sessionId,
      clientSessionId: requestInput.clientSessionId,
    })
  }

  registerInput.httpServer.registerRespond(async (request) => {
    try {
      const url = new URL(request.url)
      const path = url.pathname.replace('/rpc/', '').split('/')

      const maybeSessionId = SessionIdHttp.fromRequest(request)
      const sessionId = maybeSessionId ?? SessionId.generate()

      const maybeClientSessionId = ClientSessionIdHttp.fromRequest(request)
      const clientSessionId = maybeClientSessionId ?? ClientSessionId.generate()

      const response = await handleRequest({
        contract: registerInput.contract,
        handlers: registerInput.implementation,
        path,
        request,
        sessionId,
        clientSessionId,
      })

      if (!response) return null

      const responseWithCORS = allowCORS({ request, response })

      if (!maybeSessionId) {
        responseWithCORS.headers.set('Set-Cookie', SessionIdHttp.toSetCookieHeaderValue({ sessionId, isProd: true }))
      }

      return responseWithCORS
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), { status: 400 })
    }
  })
}
