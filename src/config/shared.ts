import { HttpServerImpl } from '../@/http-server/http-server-impl'
import { TransportImpl } from '../app/wire/transport/transport-impl'

const IS_INTEGRATION_TEST = import.meta.env?.IS_INTEGRATION_TEST === 'true'

const IS_TEST = import.meta.env?.NODE_ENV === 'test'

const TRANSPORT_IMPL = TransportImpl.of('bun-web-sockets')

const HTTP_SERVER_IMPL = HttpServerImpl.of(TRANSPORT_IMPL === 'bun-web-sockets' ? 'bun' : 'node')

const IS_PROD = Boolean(import.meta.env?.PROD)

const IS_DEV = !IS_PROD

export const CONFIG_SHARED = {
  IS_INTEGRATION_TEST,
  IS_TEST,
  TRANSPORT_IMPL,
  HTTP_SERVER_IMPL,
  IS_PROD,
  IS_DEV,
}
