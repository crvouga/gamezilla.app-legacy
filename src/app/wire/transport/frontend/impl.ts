import { ILogger } from '~/@/logger'
import * as ImplWebSockets from './impl-standard-web-sockets'
import { initFrontendTransport, type IFrontendTransport } from './interface'

export type Config = ImplWebSockets.Config | { t: 'noop'; logger: ILogger }

export const FrontendTransport = async <MsgToBackend, MsgToFrontend>(
  config: Config,
): Promise<
  IFrontendTransport<{
    MsgToBackend: MsgToBackend
    MsgToFrontend: MsgToFrontend
  }>
> => {
  switch (config.t) {
    case 'standard-web-sockets': {
      return ImplWebSockets.FrontendTransport<MsgToBackend, MsgToFrontend>(config)
    }
    case 'noop': {
      config.logger.warn('FrontendTransport noop not implemented')
      return initFrontendTransport<MsgToBackend, MsgToFrontend>()
    }
  }
}
