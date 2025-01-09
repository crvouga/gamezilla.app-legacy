import { ServerImpl } from '../@/web-server/server-impl'
import { TransportImpl } from '../app/wire/transport/transport-impl'
import { env } from './env'

export const IS_PROD = Boolean(env.PROD)

export const IS_INTEGRATION_TEST = env.IS_INTEGRATION_TEST === 'true'

export const IS_TEST = env.NODE_ENV === 'test'

export const TRANSPORT_IMPL = TransportImpl.of('bun-web-sockets')

export const SERVER_IMPL = ServerImpl.of(TRANSPORT_IMPL === 'bun-web-sockets' ? 'bun' : 'node')
