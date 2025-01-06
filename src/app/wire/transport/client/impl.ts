import { ILogger } from '~/@/logger'
import * as ImplWebSockets from './impl-standard-web-sockets'
import { initClientTransport, type IClientTransport } from './interface'

export type Config = ImplWebSockets.Config | { t: 'noop'; logger: ILogger }

export const ClientTransport = async <MsgToServer, MsgToClient>(
  config: Config,
): Promise<
  IClientTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
> => {
  switch (config.t) {
    case 'standard-web-sockets': {
      return ImplWebSockets.ClientTransport<MsgToServer, MsgToClient>(config)
    }
    case 'noop': {
      config.logger.warn('ClientTransport noop not implemented')
      return initClientTransport<MsgToServer, MsgToClient>()
    }
  }
}
