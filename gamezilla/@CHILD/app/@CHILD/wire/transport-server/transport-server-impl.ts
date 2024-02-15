import { ServerInstance } from "gamezilla/@SHARED/server"
import { IServerTransport } from "./transport-server"
import { ServerTransportBunWebSockets } from "./transport-server-impl-bun-web-sockets"
import { ServerTransportSocketIO } from "./transport-server-impl-socket-io"

export const ServerTransport = <MsgToServer, MsgToClient>({
  server,
  codebaseVersionId,
}: {
  server: ServerInstance
  codebaseVersionId: string
}): IServerTransport<{
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
}> => {
  switch (server.t) {
    case "bun": {
      return ServerTransportBunWebSockets<MsgToServer, MsgToClient>({
        codebaseVersionId,
        server,
      })
    }

    case "node": {
      return ServerTransportSocketIO<MsgToServer, MsgToClient>({
        codebaseVersionId,
        server,
      })
    }
  }
}
