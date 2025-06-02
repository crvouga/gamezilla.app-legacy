import { IHttpServer } from '~/@/http-server'
import { isErr } from '~/@/result'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { SessionId } from '~/@/wire/session-id'
import { SessionIdHttp } from '~/@/wire/session-id-http'
import { Base, Contract, Server } from '../types'

export const registerRespond = <T extends Base>(config: {
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
    try {
      const endpointConfig = requestInput.contract[requestInput.name]

      if (!endpointConfig) return null

      const handler = requestInput.handlers[requestInput.name]

      if (typeof handler !== 'function') return null

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

  config.httpServer.registerRespond(async (request) => {
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
        contract: config.contract,
        handlers: config.server,
        name: rpcName ?? '',
        request,
        sessionId,
        clientSessionId,
      })

      if (!response) return null

      if (!maybeSessionId) {
        response.headers.set('Set-Cookie', SessionIdHttp.toSetCookieHeaderValue({ sessionId, isProd: true }))
      }

      return response
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
    }
  })
}
