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
  server: Server<T>
}) => {
  const handleRequest = async (requestInput: {
    contract: Contract<any>
    handlers: Server<any>
    name: string
    request: Request
    sessionId: SessionId
    clientSessionId: ClientSessionId
  }) => {
    const endpointConfig = requestInput.contract[requestInput.name]

    if (!endpointConfig) return null

    const handler = requestInput.handlers[requestInput.name]

    if (typeof handler !== 'function') return null

    if ('input' in endpointConfig && 'output' in endpointConfig && typeof handler === 'function') {
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
      handlers: handler as unknown as Server<any>,
      name: requestInput.name.slice(1),
      request: requestInput.request,
      sessionId: requestInput.sessionId,
      clientSessionId: requestInput.clientSessionId,
    })
  }

  registerInput.httpServer.registerRespond(async (request) => {
    try {
      const url = new URL(request.url)
      if (url.pathname !== '/rpc') {
        return null
      }

      const rpcName = url.searchParams.get('rpc-name')

      if (!rpcName) {
        return new Response(JSON.stringify({ error: 'rpc-name is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const maybeSessionId = SessionIdHttp.fromRequest(request)
      const sessionId = maybeSessionId ?? SessionId.generate()

      const maybeClientSessionId = ClientSessionIdHttp.fromRequest(request)
      const clientSessionId = maybeClientSessionId ?? ClientSessionId.generate()

      const response = await handleRequest({
        contract: registerInput.contract,
        handlers: registerInput.server,
        name: rpcName ?? '',
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
      return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
    }
  })
}
