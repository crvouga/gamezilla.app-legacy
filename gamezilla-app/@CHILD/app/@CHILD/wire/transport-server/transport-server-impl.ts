import { ServerInstance } from "gamezilla-app/@SHARED/server"
import { IServerTransport } from "./transport-server"
import { ServerTransportBunWebSockets } from "./transport-server-impl-bun-web-sockets"
import { ServerTransportSocketIO } from "./transport-server-impl-socket-io"

export const ServerTransport = async <MsgToServer, MsgToClient>({
  server,
  codebaseVersionId,
  databaseUrl,
}: {
  server: ServerInstance
  codebaseVersionId: string
  databaseUrl: string
}): Promise<
  IServerTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
> => {
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
        databaseUrl,
      })
    }
  }
}
