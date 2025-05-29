import { s } from '~/@/schema'
import * as RPC from '../rpc'

export const childRpcContract = RPC.initContract({
  baz: {
    input: s.obj({
      name: s.str,
    }),
    output: s.obj({
      message: s.str,
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
    input: s.obj({
      name: s.str,
      age: s.num,
    }),
    output: s.obj({
      message: s.str,
    }),
  },
  bar: {
    input: s.obj({
      name: s.str,
    }),
    output: s.obj({
      message: s.str,
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
