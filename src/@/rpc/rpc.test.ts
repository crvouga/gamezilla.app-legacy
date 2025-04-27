import { HttpClient } from '~/@/http-client'
import { HttpServer } from '~/@/http-server'
import { Logger } from '~/@/logger'
import { p } from '~/@/parser'
import * as RPC from './rpc'
import { describe, expect, test } from 'bun:test'
import { isErr, Ok } from '../result'

const childRpcContract = RPC.initContract({
  baz: {
    input: p.obj({
      name: p.str,
    }),
    output: p.obj({
      message: p.str,
    }),
  },
})

const childRpcBackend = RPC.initServer(childRpcContract, {
  async baz(input) {
    return {
      message: `Yo, ${input.name}`,
    }
  },
})

const contract = RPC.initContract({
  child: childRpcContract,
  foo: {
    input: p.obj({
      name: p.str,
      age: p.num,
    }),
    output: p.obj({
      message: p.str,
    }),
  },
  bar: {
    input: p.obj({
      name: p.str,
    }),
    output: p.obj({
      message: p.str,
    }),
  },
})

const server = RPC.initServer(contract, {
  child: childRpcBackend,
  async bar(input) {
    return {
      message: `Hi, ${input.name}`,
    }
  },
  async foo(input) {
    return {
      message: `Hello, ${input.name}`,
    }
  },
})

//
//
//  Usage
//
//

const Fixture = async () => {
  const port = 1234
  const httpServer = HttpServer({
    t: 'bun',
    logger: Logger({ t: 'noop' }),
  })
  const httpClient = HttpClient({
    t: 'fetch',
  })
  const serverUrl = `http://localhost:${port}`
  RPC.registerRespond({
    httpServer,
    contract,
    implementation: server,
  })

  const client = RPC.initClient({
    httpClient,
    contract,
    backendUrl: serverUrl,
  })

  await httpServer.start(port)

  return {
    httpServer,
    httpClient,
    serverUrl,
    client,
    [Symbol.dispose]: async () => {
      await httpServer.stop()
    },
  }
}

describe('RPC', () => {
  test('should work', async () => {
    using f = await Fixture()
    const result = await f.client.foo({ name: 'Alice', age: 30 })
    expect(result).toEqual(Ok({ message: 'Hello, Alice' }))
  })

  test('should work nested', async () => {
    using f = await Fixture()
    const result = await f.client.child.baz({ name: 'Charlie' })
    expect(result).toEqual(Ok({ message: 'Yo, Charlie' }))
  })

  test('should handle validation errors', async () => {
    using f = await Fixture()
    const result = await f.client.foo({ name: 'Alice', age: 'invalid' as any })
    expect(isErr(result)).toBe(true)
  })

  test('should handle nested validation errors', async () => {
    using f = await Fixture()
    const result = await f.client.child.baz({ name: 123 as any })
    expect(isErr(result)).toBe(true)
  })

  test('should handle non-existent endpoints', async () => {
    using f = await Fixture()
    // @ts-expect-error Testing runtime behavior with invalid endpoint
    const result = await f.client.nonExistent?.({ data: 'test' })
    expect(result).toBeUndefined()
  })
})
