import * as ImplSocketIo from './impl-socket-io'
import * as ImplWebSockets from './impl-standard-web-sockets'
import type { IClientTransport } from './interface'

export type Config = ImplSocketIo.Config | ImplWebSockets.Config

export const ClientTransport = async <MsgToServer, MsgToClient>(
  config: Config
): Promise<
  IClientTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
> => {
  switch (config.t) {
    case 'standard-web-sockets': {
      return ClientTransport<MsgToServer, MsgToClient>(config)
    }

    case 'socket.io': {
      return ClientTransport<MsgToServer, MsgToClient>(config)
    }
  }
}
