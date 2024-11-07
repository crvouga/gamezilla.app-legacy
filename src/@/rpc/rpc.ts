import { p } from '../core/parser'

type Base = Contract<Record<string, Endpoint<any, any>>>

export type Endpoint<TInput, TOutput> = {
  input: p.Parser<TInput>
  output: p.Parser<TOutput>
}

export type Contract<TEndpoints extends Record<string, Endpoint<any, any>>> = TEndpoints

export type Client<T extends Base> = {
  [K in keyof T]: (input: p.Infer<T[K]['input']>) => Promise<p.Infer<T[K]['output']>>
}

export type Server<T extends Base> = {
  [K in keyof T]: (input: p.Infer<T[K]['input']>) => Promise<p.Infer<T[K]['output']>>
}

export const initContract = <TEndpoints extends Record<string, Endpoint<any, any>>>(
  endpoints: TEndpoints
): Contract<TEndpoints> => endpoints

export const initClient = <T extends Base>(contract: T): Client<T> => {
  const client: Partial<Client<T>> = {}

  for (const endpoint in contract) {
    client[endpoint as keyof T] = async (_input: p.Infer<T[typeof endpoint]['input']>) => {
      return {} as p.Infer<T[typeof endpoint]['output']>
    }
  }

  return client as Client<T>
}

// Initialize the server with typed endpoints for autocompletion
export const initServer = <T extends Base>(_contract: T, server: Server<T>): Server<T> => {
  return server
}

const contract = initContract({
  foo: {
    input: p.obj({
      name: p.str,
      age: p.num
    }),
    output: p.obj({
      message: p.str
    })
  },
  bar: {
    input: p.obj({
      name: p.str
    }),
    output: p.obj({
      message: p.str
    })
  }
})

// Usage
const rpcClient = initClient(contract)
const rpcServer = initServer(contract, {
  bar: async (input) => {
    return { message: `Hi, ${input.name}` }
  },
  foo: async (input) => {
    return { message: `Hello, ${input.name}` }
  }
})

// Example client calls
rpcClient.foo({ name: 'Alice', age: 30 }).then((response) => console.log(response))
rpcClient.bar({ name: 'Bob' }).then((response) => console.log(response))

// Example server implementation with autocompletion
rpcServer.foo = async (input) => {
  return { message: `Hello, ${input.name}` }
}
rpcServer.bar = async (input) => {
  return { message: `Hi, ${input.name}` }
}
