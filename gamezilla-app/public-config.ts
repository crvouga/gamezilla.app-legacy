import { VDomImpl } from "gamezilla-app/@SHARED/vdom"
import config from "../config.json"

//
//
//
// Environment
//
//
//

export const IS_PROD = process.env["NODE_ENV"] === "production"

//
//
//
// Renderer
//
//
//

export const VDOM_IMPL: VDomImpl = "snabbdom" as VDomImpl

//
//
//
// Server
//
//
//

export type ServerImpl = "bun" | "node"

export const SERVER_IMPL = "bun" as ServerImpl

//
//
//
// Transport
//
//
//

export type TransportImpl = "bun-web-sockets" | "socket.io"

export const TRANSPORT_IMPL =
  SERVER_IMPL === "bun" ? "bun-web-sockets" : "socket.io"

//
//
//
// Server URLs
//
//
//

const SERVER_PORT_LOCAL = 5001
const SERVER_URL_LOCAL = `http://localhost:${SERVER_PORT_LOCAL}/`
const SERVER_URL_NGROK = "https://gamezilla-server.ngrok.io/"
const SERVER_URL_PROD = "https://server.gamezilla.app/"

const USE_NGROK = false

export const SERVER_URL = IS_PROD
  ? SERVER_URL_PROD
  : USE_NGROK
  ? SERVER_URL_NGROK
  : SERVER_URL_LOCAL

export const SERVER_PORT = Number(process.env?.["PORT"] ?? SERVER_PORT_LOCAL)

//
//
//
//
//
//
//

export const CODEBASE_VERSION_ID = config["codebase_version_id"]
