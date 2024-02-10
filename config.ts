import config from "./config.json"

//
//
//
// Environment
//
//
//

const IS_PROD = process.env["NODE_ENV"] === "production"

//
//
//
// Renderer
//
//
//

export type RendererImpl = "inferno" | "preact" | "react" | "react-with-million"

const RENDERER_IMPL: RendererImpl = "inferno" as RendererImpl

//
//
//
// Transport
//
//
//

export type TransportImpl = "socket-io" | "bun-web-sockets"

const TRANSPORT_IMPL = "bun-web-sockets" as TransportImpl

//
//
//
// Server URLs
//
//
//

const SERVER_PORT_LOCAL = 5002
const SERVER_URL_LOCAL = `http://localhost:${SERVER_PORT_LOCAL}/`
const SERVER_URL_NGROK = "https://gamezilla-server.ngrok.io/"
const SERVER_URL_PROD = "https://server.gamezilla.app/"
const WEB_SOCKETS_ENDPOINT = "/ws"

const USE_NGROK = false

const SERVER_URL = IS_PROD
  ? SERVER_URL_PROD
  : USE_NGROK
  ? SERVER_URL_NGROK
  : SERVER_URL_LOCAL

const SERVER_PORT = Number(process.env["PORT"] ?? SERVER_PORT_LOCAL)

if (!SERVER_URL) {
  throw new Error("SERVER_URL not set")
}

//
//
//
//
//
//
//

const CODEBASE_VERSION_ID = config["codebase_version_id"]

if (!CODEBASE_VERSION_ID) {
  throw new Error("CODEBASE_VERSION_ID not set")
}

//
//
//
//
//
//
//

const SHOULD_USE_DEBUGGER = !IS_PROD || true

//
//
//
//
//
//

export const PUBLIC_APP_CONFIG = {
  SHOULD_USE_DEBUGGER,
  IS_PROD,
  RENDERER_IMPL,
  TRANSPORT_IMPL,
  SERVER_URL,
  SERVER_PORT,
  WEB_SOCKETS_ENDPOINT,
  CODEBASE_VERSION_ID,
}
