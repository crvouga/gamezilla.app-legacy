import * as Rx from "rxjs"
import { WireStatus, ToBackend, ToFrontend } from "./App.Types"
import { Cmd, Option, pipe, Sub } from "./Core"
import { SessionId, ClientId } from "./Data"

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
): Sub.Sub<Msg> => {
  return pipe(_toFrontend, Sub.map(mapper))
}

export const sendToBackend = (msg: ToBackend): Cmd.Cmd<never> => {
  return () => {
    _sendToBackend.next(msg)
  }
}

export const onConnectionStatus = <Msg>(
  mapper: (connectionStatus: WireStatus) => Msg,
): Sub.Sub<Msg> => {
  return pipe(_connectionStatus, Sub.map(mapper))
}

//
//
//
// Backend
//
//
//

export const _toBackend = new Rx.Subject<
  [SessionId.SessionId, ClientId.ClientId, ToBackend]
>()
export const _onConnect = new Rx.Subject<
  [SessionId.SessionId, ClientId.ClientId]
>()
export const _onDisconnect = new Rx.Subject<
  [SessionId.SessionId, ClientId.ClientId]
>()
export const _sendToFrontend = new Rx.Subject<
  [ClientId.ClientId[], ToFrontend]
>()
export const _broadcast = new Rx.Subject<ToFrontend>()

export const onConnect = <Msg>(
  mapper: (sessionId: SessionId.SessionId, clientId: ClientId.ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(
    _onConnect,
    Sub.map(([sessionId, clientId]) => mapper(sessionId, clientId)),
  )
}

export const onDisconnect = <Msg>(
  mapper: (sessionId: SessionId.SessionId, clientId: ClientId.ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(
    _onDisconnect,
    Sub.map(([sessionId, clientId]) => mapper(sessionId, clientId)),
  )
}

export const fromFrontend = <Msg>(
  mapper: (
    sessionId: SessionId.SessionId,
    clientId: ClientId.ClientId,
    msg: ToBackend,
  ) => Msg,
): Sub.Sub<Msg> => {
  return pipe(
    _toBackend,
    Sub.map(([sessionId, clientId, msg]) => mapper(sessionId, clientId, msg)),
  )
}

export const sendToFrontend = (
  clientIds: ClientId.ClientId[],
  msg: ToFrontend,
): Cmd.Cmd<never> => {
  return () => {
    _sendToFrontend.next([clientIds, msg])
  }
}

export const broadcast = (msg: ToFrontend): Cmd.Cmd<never> => {
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
