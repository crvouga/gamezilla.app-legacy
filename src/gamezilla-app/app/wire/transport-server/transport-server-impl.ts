import type { ServerInstance } from 'gamezilla-app/@/server'
import { ILogger } from 'gamezilla-app/app/@/server/logger'
import type { IServerTransport } from './transport-server'
import { ServerTransportBunWebSockets } from './transport-server-impl-bun-web-sockets'
import { ServerTransportSocketIO } from './transport-server-impl-socket-io'

export const ServerTransport = async <MsgToServer, MsgToClient>({
  server,
  codebaseVersionId,
  logger
}: {
  server: ServerInstance
  codebaseVersionId: string
  logger: ILogger
}): Promise<
  IServerTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
> => {
  switch (server.t) {
    case 'bun': {
      return ServerTransportBunWebSockets<MsgToServer, MsgToClient>({
        codebaseVersionId,
        server
      })
    }

    case 'node': {
      return ServerTransportSocketIO<MsgToServer, MsgToClient>({
        codebaseVersionId,
        server,
        logger
      })
    }
  }
}
