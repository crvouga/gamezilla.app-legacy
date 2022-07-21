import * as Rx from "rxjs"
import { Server } from "socket.io"
import { Cmd, Option, pipe, Sub } from "../Core"
import { ToBackend, ToFrontend } from "../Types"
import {
  backendServerPort,
  ClientId,
  ClientToServerEvents,
  ServerToClientEvents,
} from "./Bridge"

//
//
//
//
//
//
//

const io = new Server<ClientToServerEvents, ServerToClientEvents>({
  cors: {
    origin: "*",
  },
})

const toBackend$ = new Rx.Subject<[ClientId, ToBackend]>()
const onConnect$ = new Rx.Subject<ClientId>()
const onDisconnect$ = new Rx.Subject<ClientId>()

//
//
//
// Sub
//
//
//

export const onConnect = <Msg>(
  mapper: (clientId: ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(onConnect$, Sub.map(mapper))
}

export const onDisconnect = <Msg>(
  mapper: (clientId: ClientId) => Msg,
): Sub.Sub<Msg> => {
  return pipe(onDisconnect$, Sub.map(mapper))
}

export const fromFrontend = <Msg>(
  mapper: (clientId: ClientId, msg: ToBackend) => Msg,
): Sub.Sub<Msg> => {
  return pipe(
    toBackend$,
    Sub.map(([clientId, msg]) => mapper(clientId, msg)),
  )
}

//
//
//
// Cmd
//
//
//

export const sendToFrontend = (
  clientIds: ClientId | ClientId[],
  msg: ToFrontend,
): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    io.to(clientIds).emit("ToFrontend", msg)
    return Option.None
  })
}

export const broadcast = (msg: ToFrontend): Cmd.Cmd<never> => {
  return Rx.of(async () => {
    io.emit("ToFrontend", msg)
    return Option.None
  })
}

//
//
//
// Start
//
//
//

const port = Number(process.env.PORT) || backendServerPort
io.listen(port)

console.clear()
console.log(`[backend] server running at:`)
console.log(`[backend] http://localhost:${backendServerPort}/`)

io.on("connection", (socket) => {
  onConnect$.next(socket.id)

  socket.on("disconnect", () => {
    onDisconnect$.next(socket.id)
  })

  socket.on("ToBackend", (msg) => {
    toBackend$.next([socket.id, msg])
  })
})
