export const IS_PROD = Boolean(process.env?.PROD)

export const IS_INTEGRATION_TEST = process.env?.IS_INTEGRATION_TEST === 'true'

export const IS_TEST = process.env?.NODE_ENV === 'test'

export type TransportImpl = 'bun-web-sockets' | 'noop'

export const TRANSPORT_IMPL: TransportImpl = 'bun-web-sockets' as string as TransportImpl

export type ServerImpl = 'bun' | 'node'

export const SERVER_IMPL: ServerImpl = TRANSPORT_IMPL === 'bun-web-sockets' ? 'bun' : 'node'
