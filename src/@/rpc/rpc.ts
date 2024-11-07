import { Err, isErr, Ok, Result } from '@/core'
import { IWebClient } from '@/web-client'
import { IWebServer } from '@/web-server'
import { p } from '../core/parser'

type Base = Contract<Record<string, Endpoint<any, any>>>

export type Endpoint<TInput, TOutput> = {
  input: p.Parser<TInput>
  output: p.Parser<TOutput>
}

export type Contract<TEndpoints extends Record<string, Endpoint<any, any>>> = TEndpoints

export type Client<T extends Base> = {
  [K in keyof T]: (input: p.Infer<T[K]['input']>) => Promise<Result<string, p.Infer<T[K]['output']>>>
}

export type Server<T extends Base> = {
  [K in keyof T]: (input: p.Infer<T[K]['input']>) => Promise<p.Infer<T[K]['output']>>
}

export const initContract = <TEndpoints extends Record<string, Endpoint<any, any>>>(
  endpoints: TEndpoints
): Contract<TEndpoints> => endpoints

export const initClient = <T extends Base>(webClient: IWebClient, contract: T): Client<T> => {
  const client: Partial<Client<T>> = {}
  for (const endpoint in contract) {
    const endpointConfig = contract[endpoint]
    if (!endpointConfig) {
      continue
    }

    // @ts-expect-error
    client[endpoint] =
      //
      async (input) => {
        try {
          const parsedInput = endpointConfig.input.parse(input)
          if (isErr(parsedInput)) {
            return Err(parsedInput.error)
          }
          const request = new Request(`/rpc/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedInput)
          })
          const response = await webClient.fetch(request)
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
  }

  return client as Client<T>
}

export const initServer = <T extends Base>(_contract: T, handlers: Server<T>): Server<T> => {
  return handlers
}

export const attachServer = <T extends Base>(webServer: IWebServer, contract: T, handlers: Server<T>) => {
  webServer.registerHandler(async (request) => {
    const url = new URL(request.url)
    const endpoint = url.pathname.replace('/rpc/', '')

    const endpointConfig = contract[endpoint]

    if (!endpointConfig) {
      return null
    }

    const handler = handlers[endpoint]

    if (!handler) {
      return null
    }

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
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: String(error) }), { status: 400 })
    }
  })
}
