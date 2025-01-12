import { ILogger } from '~/@/logger'
import * as ImplWebSockets from './impl-standard-web-sockets'
import { initClientTransport, type IClientTransport } from './interface'

export type Config = ImplWebSockets.Config | { t: 'noop'; logger: ILogger }

export const ClientTransport = async <MsgToBackend, MsgToClient>(
  config: Config,
): Promise<
  IClientTransport<{
    MsgToBackend: MsgToBackend
    MsgToClient: MsgToClient
  }>
> => {
  switch (config.t) {
    case 'standard-web-sockets': {
      return ImplWebSockets.ClientTransport<MsgToBackend, MsgToClient>(config)
    }
    case 'noop': {
      config.logger.warn('ClientTransport noop not implemented')
      return initClientTransport<MsgToBackend, MsgToClient>()
    }
  }
}
