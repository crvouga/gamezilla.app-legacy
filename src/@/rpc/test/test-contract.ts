import { s } from '~/@/schema'
import * as RPC from '../rpc'

export const contract = RPC.initContract({
  baz: {
    input: s.obj({
      name: s.str(),
    }),
    output: s.obj({
      message: s.str(),
    }),
  },
  foo: {
    input: s.obj({
      name: s.str(),
      age: s.num(),
    }),
    output: s.obj({
      message: s.str(),
    }),
  },
  bar: {
    input: s.obj({
      name: s.str(),
    }),
    output: s.obj({
      message: s.str(),
    }),
  },
  'foo/bar/baz': {
    input: s.obj({
      name: s.str(),
    }),
    output: s.obj({
      message: s.str(),
    }),
  },
  'foo.bar.baz': {
    input: s.obj({
      name: s.str(),
    }),
    output: s.str(),
  },
})

export const server = RPC.initServer(contract, {
  baz: async (input, _reqCtx) => {
    return {
      message: `Yo, ${input.name}`,
    }
  },
  bar: async (input, _reqCtx) => {
    return {
      message: `Hi, ${input.name}`,
    }
  },
  foo: async (input, _reqCtx) => {
    return {
      message: `Hello, ${input.name}`,
    }
  },
  'foo/bar/baz': async (input, _reqCtx) => {
    return {
      message: `Hello, ${input.name}`,
    }
  },
  'foo.bar.baz': async (input, _reqCtx) => {
    return `Hello, ${input.name}`
  },
})
