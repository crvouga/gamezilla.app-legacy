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

export const _internal_toFrontend = new Rx.Subject<ToFrontend>()
export const _internal_sendToBackend = new Rx.Subject<ToBackend>()
export const _internal_connectionStatus = new Rx.Subject<ConnectionStatus>()

export const fromBackend = <Msg>(
  mapper: (msg: ToFrontend) => Msg,
): Sub.Sub<Msg> => {
  return pipe(_internal_toFrontend, Sub.map(mapper))
}

export const sendToBackend = (msg: ToBackend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    _internal_sendToBackend.next(msg)
    return Option.None
  })
}

export const onConnectionStatus = <Msg>(
  mapper: (connectionStatus: ConnectionStatus) => Msg,
): Sub.Sub<Msg> => {
  return pipe(_internal_connectionStatus, Sub.map(mapper))
}

//
//
//
// Backend
//
//
//

export const _internal_toBackend = new Rx.Subject<
  [ClientId.ClientId, ToBackend]
>()
export const _internal_onConnect = new Rx.Subject<ClientId.ClientId>()
export const _internal_onDisconnect = new Rx.Subject<ClientId.ClientId>()
export const _internal_sendToFrontend = new Rx.Subject<
  [ClientId.ClientId[], ToFrontend]
>()
export const _internal_broadcast = new Rx.Subject<ToFrontend>()

export const onConnect = <Msg>(
  mapper: (clientId: ClientId.ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(_internal_onConnect, Sub.map(mapper))
}

export const onDisconnect = <Msg>(
  mapper: (clientId: ClientId.ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(_internal_onDisconnect, Sub.map(mapper))
}

export const fromFrontend = <Msg>(
  mapper: (clientId: ClientId.ClientId, msg: ToBackend) => Msg,
): Sub.Sub<Msg> => {
  return pipe(
    _internal_toBackend,
    Sub.map(([clientId, msg]) => mapper(clientId, msg)),
  )
}

export const sendToFrontend = (
  clientIds: ClientId.ClientId[],
  msg: ToFrontend,
): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    _internal_sendToFrontend.next([clientIds, msg])
    return Option.None
  })
}

export const broadcast = (msg: ToFrontend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    _internal_broadcast.next(msg)
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
