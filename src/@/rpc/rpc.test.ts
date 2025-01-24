import { HttpClient } from '~/@/http-client'
import { HttpServer } from '~/@/http-server'
import { Logger } from '~/@/logger'
import { p } from '~/@/parser'
import * as RPC from './rpc'

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

const httpServer = HttpServer({ t: 'bun', logger: Logger({ t: 'noop' }) })
const httpClient = HttpClient({ t: 'fetch', fetch: fetch as Fetch })

RPC.registerRespond({
  httpServer,
  contract,
  implementation: server,
})

const client = RPC.initClient(httpClient, contract)

export const example = async () => {
  await client.foo({ name: 'Alice', age: 30 })
  await client.bar({ name: 'Bob' })
  await client.child.baz({ name: 'Charlie' })
}
