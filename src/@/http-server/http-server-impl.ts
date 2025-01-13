export type HttpServerImpl = 'bun' | 'node'

const of = (impl: HttpServerImpl) => impl

export const HttpServerImpl = {
  of,
}
