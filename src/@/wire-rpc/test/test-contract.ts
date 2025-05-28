import { p } from '~/@/schema'
import * as RPC from '../rpc'

export const childRpcContract = RPC.initContract({
  baz: {
    input: p.obj({
      name: p.str,
    }),
    output: p.obj({
      message: p.str,
    }),
  },
})

export const childRpcBackend = RPC.initServer(childRpcContract, {
  async baz(input) {
    return {
      message: `Yo, ${input.name}`,
    }
  },
})

export const contract = RPC.initContract({
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

export const server = RPC.initServer(contract, {
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
