import { Logger } from 'gamezilla-app/app/@/server/logger'
import * as ImplBunWebSockets from './impl-bun-web-sockets'
import * as ImplSocketIo from './impl-socket-io'
import type { IServerTransport } from './interface'

export type Config = ImplBunWebSockets.Config | ImplSocketIo.Config

export const ServerTransport = async <MsgToServer, MsgToClient>(
  config: Config
): Promise<
  IServerTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
> => {
  const logger = Logger.prefix('server-transport', config.logger)
  switch (config.t) {
    case 'bun-server-web-sockets': {
      return ImplBunWebSockets.ServerTransport({ ...config, logger })
    }

    case 'socket-io': {
      return ImplSocketIo.ServerTransport({ ...config, logger })
    }
  }
}
