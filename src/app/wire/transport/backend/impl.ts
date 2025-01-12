import { ILogger, Logger } from '~/@/logger'
import * as ImplBunWebSockets from './impl-bun-web-sockets'
import { initBackendTransport, type IBackendTransport } from './interface'

export type Config = ImplBunWebSockets.Config | { t: 'noop'; logger: ILogger }

export const BackendTransport = async <MsgToBackend, MsgToClient>(
  config: Config,
): Promise<
  IBackendTransport<{
    MsgToBackend: MsgToBackend
    MsgToClient: MsgToClient
  }>
> => {
  const logger = Logger.prefix('backend-transport', config.logger)
  switch (config.t) {
    case 'bun-web-sockets': {
      return ImplBunWebSockets.BackendTransport({ ...config, logger })
    }
    case 'noop': {
      config.logger.warn('BackendTransport noop not implemented')
      return initBackendTransport<MsgToBackend, MsgToClient>()
    }
  }
}
