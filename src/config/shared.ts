import { HttpServerImpl } from '../@/http-server/http-server-impl'
import { TransportImpl } from '../app/wire/transport/transport-impl'

export const IS_INTEGRATION_TEST = import.meta.env?.IS_INTEGRATION_TEST === 'true'

export const IS_TEST = import.meta.env?.NODE_ENV === 'test'

export const TRANSPORT_IMPL = TransportImpl.of('bun-web-sockets')

export const HTTP_SERVER_IMPL = HttpServerImpl.of(TRANSPORT_IMPL === 'bun-web-sockets' ? 'bun' : 'node')

export const IS_PROD = Boolean(import.meta.env?.PROD)

export const IS_DEV = !IS_PROD
