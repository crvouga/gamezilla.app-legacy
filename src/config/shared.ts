import { ServerImpl } from '../@/web-server/server-impl'
import { TransportImpl } from '../app/wire/transport/transport-impl'

export const IS_INTEGRATION_TEST = import.meta.env?.IS_INTEGRATION_TEST === 'true'

export const IS_TEST = import.meta.env?.NODE_ENV === 'test'

export const TRANSPORT_IMPL = TransportImpl.of('bun-web-sockets')

export const SERVER_IMPL = ServerImpl.of(TRANSPORT_IMPL === 'bun-web-sockets' ? 'bun' : 'node')
