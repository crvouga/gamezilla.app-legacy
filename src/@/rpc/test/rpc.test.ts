import { describe, expect, test } from 'bun:test'
import { HttpClient } from '~/@/http-client'
import { HttpServer } from '~/@/http-server'
import { Logger } from '~/@/logger'
import { isErr, Ok } from '~/@/result'
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

  const httpServer = HttpServer({
    t: 'bun',
    logger: Logger({ t: 'noop' }),
  })

  const clientSessionId = ClientSessionId.generate()

  const serverUrl = `http://localhost:${port}`

  const httpClient = HttpClient({
    t: 'fetch',
    defaultHeaders: {
      Origin: serverUrl,
    },
  })

  RPC.registerRespond({
    httpServer,
    contract,
    server,
  })

  const client = RPC.initClient({
    t: 'http',
    httpClient,
    contract,
    serverUrl,
    clientSessionId,
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
  return [
    // await FixtureHttp(),
    await FixtureLocal(),
  ]
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
      const result = await f.client.child.baz({ name: 'Charlie' })
      expect(result).toEqual(Ok({ message: 'Yo, Charlie' }))
    }
  })

  test('should handle validation errors', async () => {
    for (using f of await Fixtures()) {
      const result = await f.client.foo({ name: 'Alice', age: 'invalid' as any })
      expect(isErr(result)).toBe(true)
    }
  })

  test('should handle nested validation errors', async () => {
    for (using f of await Fixtures()) {
      const result = await f.client.child.baz({ name: 123 as any })
      expect(isErr(result)).toBe(true)
    }
  })

  test('should handle non-existent endpoints', async () => {
    for (using f of await Fixtures()) {
      // @ts-expect-error Testing runtime behavior with invalid endpoint
      const result = await f.client.nonExistent?.({ data: 'test' })
      expect(result).toBeUndefined()
    }
  })
})
