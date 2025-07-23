import { HttpClient } from '~/@/http-client'
import { HttpServer } from '~/@/http-server'
import { Cors } from '~/@/http-server/cors/cors'
import { CorsPolicy } from '~/@/http-server/cors/cors-policy/impl'
import { ILogger } from '~/@/logger'
import { Logger } from '~/@/logger/impl'
import { isErr, Ok } from '~/@/result'
import { describe, expect, test } from '~/@/test-runner'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import * as RPC from '../rpc'
import { contract, server } from './test-contract'

type Fixture = {
  client: RPC.Client<typeof contract>
  [Symbol.dispose]: () => Promise<void>
}

export const FixtureHttp = async (): Promise<Fixture> => {
  const port = 1234

  let logger: ILogger
  logger ??= Logger.init({ t: 'noop' })
  logger ??= Logger.init({
    t: 'console',
    namespace: ['rpc', 'test'],
    newLinePerMsg: false,
    maxLogLevel: 'info',
  })

  const httpServer = HttpServer.init({ t: 'node', logger })

  httpServer.registerMiddleware(
    Cors.middleware(
      CorsPolicy.init({
        t: 'allow-sub-domains',
        allowedDomains: [],
        allowRequestHostDomain: true,
        logger,
      }),
    ),
  )

  const clientSessionId = ClientSessionId.generate()

  const serverUrl = `http://localhost:${port}`

  RPC.registerRespond({ httpServer, contract, server, logger })

  const httpClient = HttpClient.init({
    t: 'fetch',
    mapHeaders: (headers) => {
      headers.set('Origin', 'http://localhost:2222')
      return headers
    },
    credentials: 'include',
  })

  const client = RPC.initClient({
    t: 'http',
    contract,
    serverUrl,
    clientSessionId,
    httpClient,
  })

  await httpServer.start(port)

  return {
    client,
    [Symbol.dispose]: async () => {
      await httpServer.stop()
    },
  }
}

const FixtureLocal = async (): Promise<Fixture> => {
  const client = RPC.initClient({
    t: 'local',
    contract: contract,
    clientSessionId: ClientSessionId.generate(),
    sessionId: SessionId.generate(),
    server: server,
  })

  return {
    client,
    [Symbol.dispose]: async () => {},
  }
}

const Fixtures = async (): Promise<Fixture[]> => {
  return [await FixtureHttp(), await FixtureLocal()]
}

describe('RPC', () => {
  test('should work', async () => {
    for (using f of await Fixtures()) {
      const result = await f.client.foo({ name: 'Alice', age: 30 })
      expect(result).toEqual(Ok({ message: 'Hello, Alice' }))
    }
  })

  test('should work nested', async () => {
    for (using f of await Fixtures()) {
      const result = await f.client.baz({ name: 'Charlie' })
      expect(result).toEqual(Ok({ message: 'Yo, Charlie' }))
    }
  })

  test('should handle validation errors', async () => {
    for (using f of await Fixtures()) {
      const result = await f.client.foo({
        name: 'Alice',
        // @ts-expect-error Testing runtime behavior with invalid endpoint
        age: 'invalid',
      })
      expect(isErr(result)).toEqual(true)
    }
  })

  test('should handle nested validation errors', async () => {
    for (using f of await Fixtures()) {
      const result = await f.client.baz({
        // @ts-expect-error Testing runtime behavior with invalid endpoint
        name: 123,
      })
      expect(isErr(result)).toEqual(true)
    }
  })

  test('should handle non-existent endpoints', async () => {
    for (using f of await Fixtures()) {
      const result = await f.client
        // @ts-expect-error Testing runtime behavior with invalid endpoint
        .nonExistent?.({ data: 'test' })
      expect(result).toBeFalsy()
    }
  })

  test('nested', async () => {
    for (using f of await Fixtures()) {
      const result = await f.client['foo/bar/baz']({ name: 'Alice' })
      expect(result).toEqual(Ok({ message: 'Hello, Alice' }))
    }
  })

  test('nested dot', async () => {
    for (using f of await Fixtures()) {
      const result = await f.client['foo.bar.baz']({ name: 'Alice' })
      expect(result).toEqual(Ok('Hello, Alice'))
    }
  })
})
