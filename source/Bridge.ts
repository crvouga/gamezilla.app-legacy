import * as Rx from "rxjs"
import { Cmd, Option, pipe, Sub } from "./Core"
import { ClientId } from "./Data"
import { ToBackend, ToFrontend } from "./Types"

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

// 
// 
// 
// Frontend
// 
// 
// 

export type ConnectionStatus =
  | "Connecting"
  | "Reconnecting"
  | "Disconnected"
  | "Connected"

export const connectionStatus$ = new Rx.Subject<ConnectionStatus>()
export const toFrontend$ = new Rx.Subject<ToFrontend>()
export const sendToBackend$ = new Rx.Subject<ToBackend>()

export const onConnectionChanged = <Msg>(
  mapper: (connectionStatus: ConnectionStatus) => Msg,
): Sub.Sub<Msg> => {
  return pipe(connectionStatus$, Sub.map(mapper))
}

export const fromBackend = <Msg>(
  mapper: (msg: ToFrontend) => Msg,
): Sub.Sub<Msg> => {
  return pipe(toFrontend$, Sub.map(mapper))
}

export const sendToBackend = (msg: ToBackend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    sendToBackend$.next(msg)
    return Option.None
  })
}

//
//
//
// Backend
//
//
//

export const toBackend$ = new Rx.Subject<[ClientId.ClientId, ToBackend]>()
export const onConnect$ = new Rx.Subject<ClientId.ClientId>()
export const onDisconnect$ = new Rx.Subject<ClientId.ClientId>()
export const sendToFrontend$ = new Rx.Subject<[ClientId.ClientId[], ToFrontend]>()
export const broadcast$ = new Rx.Subject<ToFrontend>()

export const onConnect = <Msg>(
  mapper: (clientId: ClientId.ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(onConnect$, Sub.map(mapper))
}

export const onDisconnect = <Msg>(
  mapper: (clientId: ClientId.ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(onDisconnect$, Sub.map(mapper))
}

export const fromFrontend = <Msg>(
  mapper: (clientId: ClientId.ClientId, msg: ToBackend) => Msg,
): Sub.Sub<Msg> => {
  return pipe(
    toBackend$,
    Sub.map(([clientId, msg]) => mapper(clientId, msg)),
  )
}

export const sendToFrontend = (
  clientIds: ClientId.ClientId[],
  msg: ToFrontend,
): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    sendToFrontend$.next([clientIds, msg])
    return Option.None
  })
}

export const broadcast = (msg: ToFrontend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    broadcast$.next(msg)
    return Option.None
  })
}
