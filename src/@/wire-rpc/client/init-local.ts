import { Err, isErr, Ok } from '~/@/result'
import { Base, Client, ClientConfigLocal, Contract } from '../types'

export const initClientLocal = <T extends Base>(config: ClientConfigLocal<T>): Client<T> => {
  const createClient = (contract: Contract<any>, path: string[] = []): Client<any> => {
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

            const handler: unknown = [...path, endpoint].reduce(
              (acc, key) =>
                // @ts-ignore
                acc[key],
              config.server,
            )
            if (typeof handler !== 'function') {
              return Err(`No handler found for endpoint ${endpoint}`)
            }

            const outputData = await handler(parsedInput.value, {
              sessionId: config.sessionId,
              clientSessionId: config.clientSessionId,
            })

            const parsedOutput = endpointConfig.output.parse(outputData)
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
