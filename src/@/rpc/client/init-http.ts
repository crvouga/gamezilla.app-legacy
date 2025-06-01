import { Err, isErr, Ok } from '~/@/result'
import { ClientSessionIdHttp } from '../../wire/client-session-id-http'
import { Base, Client, ClientConfigHttp, Contract } from '../types'

export const initClientHttp = <T extends Base>(config: ClientConfigHttp<T>): Client<T> => {
  const createClient = (contract: Base, path: string[] = []): any => {
    const client: any = {}

    for (const rpcName in contract) {
      const endpointConfig = contract[rpcName]
      if (!endpointConfig) continue

      if ('input' in endpointConfig && 'output' in endpointConfig) {
        // Leaf endpoint
        client[rpcName] = async (input: unknown) => {
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
        client[rpcName] = createClient(endpointConfig as Contract<any>, [...path, rpcName])
      }
    }
    return client
  }

  return createClient(config.contract)
}
