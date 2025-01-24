import { Err, isErr, Ok, Result } from '~/@/result'
import { IHttpClient } from '~/@/http-client'
import { IHttpServer } from '~/@/http-server'
import { p } from '~/@/parser'

type Base = Contract<Record<string, Endpoint<any, any> | Contract<any>>>

export type Endpoint<TInput, TOutput> = {
  input: p.Parser<TInput>
  output: p.Parser<TOutput>
}

export type Contract<TEndpoints extends Record<string, Endpoint<any, any> | Contract<any>>> = TEndpoints

export type Frontend<T extends Base> = {
  [K in keyof T]: T[K] extends Endpoint<unknown, unknown>
    ? (input: p.Infer<T[K]['input']>) => Promise<Result<string, p.Infer<T[K]['output']>>>
    : T[K] extends Contract<any>
      ? Frontend<T[K]>
      : never
}

export type Backend<T extends Base> = {
  [K in keyof T]: T[K] extends Endpoint<unknown, unknown>
    ? (input: p.Infer<T[K]['input']>) => Promise<p.Infer<T[K]['output']>>
    : T[K] extends Contract<any>
      ? Backend<T[K]>
      : never
}

export const initContract = <TEndpoints extends Record<string, Endpoint<any, any> | Contract<any>>>(
  endpoints: TEndpoints,
): Contract<TEndpoints> => endpoints

export const initClient = <T extends Base>(webFrontend: IHttpClient, contract: T): Frontend<T> => {
  const createFrontend = (contract: Base, path: string[] = []): any => {
    const frontend: any = {}

    for (const endpoint in contract) {
      const endpointConfig = contract[endpoint]
      if (!endpointConfig) continue

      if ('input' in endpointConfig && 'output' in endpointConfig) {
        // Leaf endpoint
        frontend[endpoint] = async (input: any) => {
          try {
            const parsedInput = endpointConfig.input.parse(input)
            if (isErr(parsedInput)) {
              return Err(parsedInput.error)
            }
            const request = new Request(`/rpc/${[...path, endpoint].join('/')}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsedInput),
            })
            const response = await webFrontend.fetch(request)
            if (!response.ok) {
              return Err(`Request failed with status ${response.status}`)
            }
            const data = await response.json()
            const parsedOutput = endpointConfig.output.parse(data)
            return Ok(parsedOutput)
          } catch (error) {
            return Err(`Error: ${error}`)
          }
        }
      } else {
        // Nested contract
        frontend[endpoint] = createFrontend(endpointConfig as Contract<any>, [...path, endpoint])
      }
    }
    return frontend
  }

  return createFrontend(contract)
}

export const initBackend = <T extends Base>(_contract: T, handlers: Backend<T>): Backend<T> => {
  return handlers
}

export const registerRespond = <T extends Base>({
  contract,
  handlers,
  httpServer,
}: {
  httpServer: IHttpServer
  contract: T
  handlers: Backend<T>
}) => {
  const handleRequest = async (contract: Contract<any>, handlers: Backend<any>, path: string[], request: Request) => {
    const endpointName = path[0]
    if (!endpointName) {
      return null
    }
    const endpointConfig = contract[endpointName]
    const handler = handlers[endpointName]

    if (!endpointConfig || !handler) {
      return null
    }

    if ('input' in endpointConfig && 'output' in endpointConfig && typeof handler === 'function') {
      // Leaf endpoint
      try {
        const requestData = await request.json()
        const parsedInput = endpointConfig.input.parse(requestData)
        if (isErr(parsedInput)) {
          return new Response(JSON.stringify({ error: parsedInput.error }), { status: 400 })
        }
        const outputData = await handler(parsedInput.value)
        const parsedOutput = endpointConfig.output.parse(outputData)

        if (isErr(parsedOutput)) {
          return new Response(JSON.stringify({ error: parsedOutput.error }), { status: 500 })
        }

        return new Response(JSON.stringify(parsedOutput.value), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), { status: 400 })
      }
    } else {
      // Nested contract
      return handleRequest(endpointConfig as Contract<any>, handler as Backend<any>, path.slice(1), request)
    }
  }

  httpServer.registerRespond(async (request) => {
    try {
      const url = new URL(request.url)
      const path = url.pathname.replace('/rpc/', '').split('/')

      return handleRequest(contract, handlers, path, request)
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), { status: 400 })
    }
  })
}
