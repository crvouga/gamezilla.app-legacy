import { Err, isErr, Ok } from '~/@/result'
import { ClientSessionIdHttp } from '../../wire/client-session-id-http'
import { Base, Client, ClientConfigHttp } from '../types'

export const initClientHttp = <T extends Base>(config: ClientConfigHttp<T>): Client<T> => {
  const client: Client<T> = Object.entries(config.contract)
    .map(([rpcName, endpointConfig]) => {
      return [
        rpcName,
        async (input: unknown) => {
          try {
            const parsedInput = endpointConfig.input.parse(input)
            if (isErr(parsedInput)) {
              return Err(parsedInput.error)
            }
            const urlBase = new URL(`/rpc`, config.serverUrl)
            urlBase.searchParams.set('rpc-name', rpcName)
            const url = ClientSessionIdHttp.addToUrl(urlBase, config.clientSessionId)
            const request = new Request(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsedInput.value),
            })
            const response = await fetch(request)
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
        },
      ] as const
    })
    .reduce((acc, [rpcName, fn]) => {
      // @ts-ignore
      acc[rpcName] = fn
      return acc
    }, {} as Client<T>)

  return client
}
