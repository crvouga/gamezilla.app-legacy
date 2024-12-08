import { ILogger, Logger } from '~/app/@/server/logger'
import * as ImplBunWebSockets from './impl-bun-web-sockets'
import { initServerTransport, type IServerTransport } from './interface'

export type Config = ImplBunWebSockets.Config | { t: 'noop'; logger: ILogger }

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
    case 'bun-web-sockets': {
      return ImplBunWebSockets.ServerTransport({ ...config, logger })
    }
    case 'noop': {
      config.logger.warn('ServerTransport noop not implemented')
      return initServerTransport<MsgToServer, MsgToClient>()
    }
  }
}
