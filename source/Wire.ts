import * as Rx from "rxjs"
import { ToBackend, ToFrontend, WireStatus } from "./App.Types"
import { Cmd, p, Sub } from "./Core"
import { ClientId, SessionId } from "./Data"

//
//
//
// Frontend
//
//
//

export const _toFrontend = new Rx.Subject<ToFrontend>()
export const _sendToBackend = new Rx.Subject<ToBackend>()
export const _connectionStatus = new Rx.Subject<WireStatus>()

export const fromBackend = <Msg>(
  mapper: (msg: ToFrontend) => Msg,
): Sub<Msg> => {
  return p(_toFrontend, Sub.map(mapper))
}

export const sendToBackend = (msg: ToBackend): Cmd => {
  return () => {
    _sendToBackend.next(msg)
  }
}

export const onConnectionStatus = <Msg>(
  mapper: (connectionStatus: WireStatus) => Msg,
): Sub<Msg> => {
  return p(_connectionStatus, Sub.map(mapper))
}

//
//
//
// Backend
//
//
//

export const _toBackend = new Rx.Subject<
  [SessionId, ClientId, ToBackend]
>()
export const _onConnect = new Rx.Subject<
  [SessionId, ClientId]
>()
export const _onDisconnect = new Rx.Subject<
  [SessionId, ClientId]
>()
export const _sendToFrontend = new Rx.Subject<
  [ClientId[], ToFrontend]
>()
export const _broadcast = new Rx.Subject<ToFrontend>()

export const onConnect = <Msg>(
  mapper: (sessionId: SessionId, clientId: ClientId) => Msg,
): Sub<Msg> => {
  return p(
    _onConnect,
    Sub.map(([sessionId, clientId]) => mapper(sessionId, clientId)),
  )
}

export const onDisconnect = <Msg>(
  mapper: (sessionId: SessionId, clientId: ClientId) => Msg,
): Sub<Msg> => {
  return p(
    _onDisconnect,
    Sub.map(([sessionId, clientId]) => mapper(sessionId, clientId)),
  )
}

export const fromFrontend = <Msg>(
  mapper: (
    sessionId: SessionId,
    clientId: ClientId,
    msg: ToBackend,
  ) => Msg,
): Sub<Msg> => {
  return p(
    _toBackend,
    Sub.map(([sessionId, clientId, msg]) => mapper(sessionId, clientId, msg)),
  )
}

export const sendToFrontend = (
  clientIds: ClientId[],
  msg: ToFrontend,
): Cmd => {
  return () => {
    _sendToFrontend.next([clientIds, msg])
  }
}

export const broadcast = (msg: ToFrontend): Cmd => {
  return () => {
    _broadcast.next(msg)
  }
}

//
//
//
// Shared
//
//
//

export type ServerToClientEvents = {
  ToFrontend: (msg: ToFrontend) => void
}

export type ClientToServerEvents = {
  ToBackend: (msg: ToBackend) => void
}

export type InterServerEvents = {}

export type SocketData = {}

export const backendServerPort = 5000

export const sessionIdKey = "gamezilla_session_id"
