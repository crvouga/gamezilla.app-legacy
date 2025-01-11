export type TransportImpl = 'bun-web-sockets' | 'noop'

const of = (impl: TransportImpl) => impl

export const TransportImpl = {
  of,
}
