import { p } from '~/@/parser'
import * as RPC from './rpc'
import { WebBackend } from '~/@/web-server'
import { WebClient } from '~/@/web-client'
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

const webBackend = WebBackend({ t: 'bun', logger: Logger({ t: 'noop' }) })
const webClient = WebClient({ t: 'fetch', fetch: fetch as Fetch })

RPC.withRPC({ webBackend, contract: rpcContract, handlers: rpcBackend })

const rpcClient = RPC.initClient(webClient, rpcContract)

;async () => {
  await rpcClient.foo({ name: 'Alice', age: 30 })

  await rpcClient.bar({ name: 'Bob' })
}
