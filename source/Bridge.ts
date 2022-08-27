import * as Rx from "rxjs"
import { Cmd, Option, pipe, Sub } from "./Core"
import { ClientId } from "./Data"
import { ToBackend, ToFrontend, ConnectionStatus } from "./App.Types"

//
//
//
// Frontend
//
//
//

export const _toFrontend = new Rx.Subject<ToFrontend>()
export const _sendToBackend = new Rx.Subject<ToBackend>()
export const _connectionStatus = new Rx.Subject<ConnectionStatus>()

export const fromBackend = <Msg>(
  mapper: (msg: ToFrontend) => Msg,
): Sub.Sub<Msg> => {
  return pipe(_toFrontend, Sub.map(mapper))
}

export const sendToBackend = (msg: ToBackend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    _sendToBackend.next(msg)
    return Option.None
  })
}

export const onConnectionStatus = <Msg>(
  mapper: (connectionStatus: ConnectionStatus) => Msg,
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

export const _toBackend = new Rx.Subject<[ClientId.ClientId, ToBackend]>()
export const _onConnect = new Rx.Subject<ClientId.ClientId>()
export const _onDisconnect = new Rx.Subject<ClientId.ClientId>()
export const _sendToFrontend = new Rx.Subject<
  [ClientId.ClientId[], ToFrontend]
>()
export const _broadcast = new Rx.Subject<ToFrontend>()

export const onConnect = <Msg>(
  mapper: (clientId: ClientId.ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(_onConnect, Sub.map(mapper))
}

export const onDisconnect = <Msg>(
  mapper: (clientId: ClientId.ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(_onDisconnect, Sub.map(mapper))
}

export const fromFrontend = <Msg>(
  mapper: (clientId: ClientId.ClientId, msg: ToBackend) => Msg,
): Sub.Sub<Msg> => {
  return pipe(
    _toBackend,
    Sub.map(([clientId, msg]) => mapper(clientId, msg)),
  )
}

export const sendToFrontend = (
  clientIds: ClientId.ClientId[],
  msg: ToFrontend,
): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    _sendToFrontend.next([clientIds, msg])
    return Option.None
  })
}

export const broadcast = (msg: ToFrontend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    _broadcast.next(msg)
    return Option.None
  })
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

export const backendServerPort = 5000
