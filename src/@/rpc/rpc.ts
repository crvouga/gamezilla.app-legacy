import { IHttpClient } from '~/@/http-client'
import { IHttpServer } from '~/@/http-server'
import { p } from '~/@/parser'
import { Err, isErr, Ok, Result } from '~/@/result'
import { allowCORS } from '../http-server/cors'
import { ClientSessionId } from '../wire/client-session-id'
import { ClientSessionIdHttp } from '../wire/client-session-id-http'
import { SessionId } from '../wire/session-id'
import { SessionIdHttp } from '../wire/session-id-http'
import { RPCError } from './rpc-error'
import { ClientSessionIdStorage } from '../wire/client-session-id-storage'

type Base = Contract<Record<string, Endpoint<any, any> | Contract<any>>>

export type Endpoint<TInput, TOutput> = {
  input: p.Parser<TInput>
  output: p.Parser<TOutput>
}

export type ReqCtx = {
  sessionId: SessionId
  clientSessionId: ClientSessionId
}

export type Contract<TEndpoints extends Record<string, Endpoint<any, any> | Contract<any>>> = TEndpoints

export type Client<T extends Base> = {
  [K in keyof T]: T[K] extends Endpoint<unknown, unknown>
    ? (input: p.Infer<T[K]['input']>) => Promise<Result<RPCError, p.Infer<T[K]['output']>>>
    : T[K] extends Contract<any>
      ? Client<T[K]>
      : never
}

export type Server<T extends Base> = {
  [K in keyof T]: T[K] extends Endpoint<unknown, unknown>
    ? (input: p.Infer<T[K]['input']>, reqCtx: ReqCtx) => Promise<p.Infer<T[K]['output']>>
    : T[K] extends Contract<any>
      ? Server<T[K]>
      : never
}

export const initContract = <TEndpoints extends Record<string, Endpoint<any, any> | Contract<any>>>(
  endpoints: TEndpoints,
): Contract<TEndpoints> => endpoints

export const initClient = <T extends Base>(config: {
  backendUrl: string
  httpClient: IHttpClient
  contract: T
}): Client<T> => {
  const createClient = (contract: Base, path: string[] = []): any => {
    const client: any = {}

    for (const endpoint in contract) {
      const endpointConfig = contract[endpoint]
      if (!endpointConfig) continue

      if ('input' in endpointConfig && 'output' in endpointConfig) {
        // Leaf endpoint
        client[endpoint] = async (input: unknown) => {
          try {
            const parsedInput = endpointConfig.input.parse(input)
            if (isErr(parsedInput)) {
              return Err(parsedInput.error)
            }
            const clientSessionId = ClientSessionIdStorage().get()

            const url = ClientSessionIdHttp.addToUrl(
              new URL(`/rpc/${[...path, endpoint].join('/')}`, config.backendUrl),
              clientSessionId,
            )

            const request = new Request(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsedInput.value),
            })
            const response = await config.httpClient.fetch(request)
            if (!response.ok) {
              return Err(`Request failed with status ${response.status}`)
            }
            const data = await response.json()
            const parsedOutput = endpointConfig.output.parse(data)
            if (isErr(parsedOutput)) {
              return Err(parsedOutput.error)
            }
            return Ok(parsedOutput.value)
          } catch (error) {
            return Err(`Error: ${error}`)
          }
        }
      } else {
        // Nested contract
        client[endpoint] = createClient(endpointConfig as Contract<any>, [...path, endpoint])
      }
    }
    return client
  }

  return createClient(config.contract)
}

export const initServer = <T extends Base>(_contract: T, handlers: Server<T>): Server<T> => {
  return handlers
}

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
