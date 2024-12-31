import { VDomImpl } from './@/vdom/vdom-impl'

export const IS_PROD = import.meta.env?.PROD

export const IS_INTEGRATION_TEST = import.meta.env?.IS_INTEGRATION_TEST === 'true'

export const IS_TEST = import.meta.env?.NODE_ENV === 'test'

export const VDOM_IMPL = VDomImpl.fromString(import.meta.env?.VITE_VDOM_IMPL) ?? 'react-with-compiler'

export const VDOM_IMPL_TEST: VDomImpl = 'react-with-compiler' as VDomImpl

export const VDOM_IMPL_CURRENT = IS_TEST ? VDOM_IMPL_TEST : VDOM_IMPL

export type TransportImpl = 'bun-web-sockets' | 'noop'

export const TRANSPORT_IMPL: TransportImpl = 'bun-web-sockets' as string as TransportImpl

export type ServerImpl = 'bun' | 'node'

export const SERVER_IMPL: ServerImpl = TRANSPORT_IMPL === 'bun-web-sockets' ? 'bun' : 'node'

export const SERVER_URL = String(import.meta.env?.VITE_SERVER_URL)
