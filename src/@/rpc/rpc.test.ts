import { p } from '~/@/parser'
import * as RPC from './rpc'
import { HttpServer } from '~/@/http-server'
import { HttpClient } from '~/@/http-client'
import { Logger } from '~/@/logger'

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

const childRpcBackend = RPC.initBackend(childRpcContract, {
  async baz(input) {
    return {
      message: `Yo, ${input.name}`,
    }
  },
})

const rpcContract = RPC.initContract({
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

const rpcBackend = RPC.initBackend(rpcContract, {
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
const webFrontend = HttpClient({ t: 'fetch', fetch: fetch as Fetch })

RPC.withRPC({ httpServer, contract: rpcContract, handlers: rpcBackend })

const rpcFrontend = RPC.initFrontend(webFrontend, rpcContract)

;async () => {
  await rpcFrontend.foo({ name: 'Alice', age: 30 })

  await rpcFrontend.bar({ name: 'Bob' })
}
