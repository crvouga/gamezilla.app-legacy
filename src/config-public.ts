import type { VDomImpl } from '~/@/vdom'

//
//
//
// Environment
//
//
//

export const IS_PROD = process.env.NODE_ENV === 'production'

export const IS_INTEGRATION_TEST = process.env.IS_INTEGRATION_TEST === 'true'

export const IS_TEST = process.env.NODE_ENV === 'test'

//
//
//
// Renderer
//
//
//

export const VDOM_IMPL: VDomImpl = 'preact' as VDomImpl

export const VDOM_IMPL_TEST: VDomImpl = 'react-with-compiler' as VDomImpl

export const VDOM_IMPL_CURRENT = IS_TEST ? VDOM_IMPL_TEST : VDOM_IMPL

//
//
//
// Server
//
//
//

export type ServerImpl = 'bun' | 'node'

export const SERVER_IMPL = 'bun' as ServerImpl

//
//
//
// Transport
//
//
//

export type TransportImpl = 'bun-web-sockets' | 'socket.io'

export const TRANSPORT_IMPL = SERVER_IMPL === 'bun' ? 'bun-web-sockets' : 'socket.io'

//
//
//
// Server URLs
//
//
//

export const SERVER_PORT_LOCAL = 5002
const SERVER_URL_LOCAL = `http://localhost:${SERVER_PORT_LOCAL}`
const SERVER_URL_NGROK = 'https://gamezilla-server.ngrok.io'
const SERVER_URL_PROD = 'https://server.gamezilla.app'

const USE_NGROK = false

export const SERVER_URL = IS_PROD ? SERVER_URL_PROD : USE_NGROK ? SERVER_URL_NGROK : SERVER_URL_LOCAL

export const SERVER_PORT = Number(process.env?.PORT ?? SERVER_PORT_LOCAL)

//
//
//
//
//
//
//

export const CODEBASE_VERSION_ID = '1'
