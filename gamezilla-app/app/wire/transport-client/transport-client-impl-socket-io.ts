import { MsgClientToMsgServer, MsgServerToMsgClient } from "../transport.core"
import {
  ClientTransportSocketIOImpl,
  IClientTransport,
  initClientTransport,
} from "./transport-client"

const SESSION_ID_KEY = "gamezilla-session-id"

export const ClientTransportSocketIO = async <MsgToServer, MsgToClient>({
  codebaseVersionId,
  impl,
}: {
  codebaseVersionId: string
  impl: ClientTransportSocketIOImpl
}): Promise<
  IClientTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
> => {
  const { io } = await import("socket.io-client")

  const transport = initClientTransport<MsgToServer, MsgToClient>()

  const start = async () => {
    const socket = io(impl.serverUrl, {
      auth: {
        sessionId: localStorage.getItem(SESSION_ID_KEY) ?? null,
      },
      transports: ["websocket"],
    })

    socket.on("connect", () => {
      transport.msgEvt.publish({ t: "server-connected" })
    })

    socket.on("connect_error", () => {
      transport.msgEvt.publish({ t: "server-connect-error" })
    })

    socket.on("disconnect", () => {
      transport.msgEvt.publish({ t: "server-disconnected" })
    })

    const sendToServer = (msgs: MsgToServer[]) => {
      const toServer: MsgClientToMsgServer<MsgToServer> = {
        t: "to-server",
        msgs,
        codebaseVersionId,
      }

      socket.emit("to-server", toServer, (err: unknown) => {
        if (err) {
          console.error("Error sending to server", err, toServer)
          sendToServer(msgs)
        }
      })
    }

    transport.toServer.subscribe((msgs) => {
      sendToServer(msgs)
    })

    socket.on("to-client", (msg: MsgServerToMsgClient<MsgToClient>) => {
      if (msg.codebaseVersionId !== codebaseVersionId) {
        console.warn("Codebase version mismatch")
      }

      switch (msg.t) {
        case "session-id": {
          localStorage.setItem(SESSION_ID_KEY, msg.sessionId)
          break
        }

        case "to-client": {
          transport.toClient.publish(msg.msgs)
          break
        }
      }
    })

    transport.msgCmd.subscribe((msgCmd) => {
      switch (msgCmd.t) {
        case "try-reconnect": {
          socket.connect()
          break
        }
        default: {
          const _exhaustiveCheck: never = msgCmd.t
          return _exhaustiveCheck
        }
      }
    })
  }

  return {
    ...transport,
    start,
  }
}
