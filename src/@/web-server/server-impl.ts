export type ServerImpl = 'bun' | 'node'

const of = (impl: ServerImpl) => impl

export const ServerImpl = {
  of,
}
