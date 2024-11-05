import type { ClientTransportImpl, IClientTransport } from './interface'
import { ClientTransportSocketIO } from './impl-socket-io'
import { ClientTransportWebSockets } from './impl-web-sockets'

export const ClientTransport = async <MsgToServer, MsgToClient>({
  codebaseVersionId,
  impl
}: {
  codebaseVersionId: string
  impl: ClientTransportImpl
}): Promise<
  IClientTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
> => {
  switch (impl.t) {
    case 'web-sockets': {
      return ClientTransportWebSockets<MsgToServer, MsgToClient>({
        codebaseVersionId,
        impl
      })
    }

    case 'socket-io': {
      return ClientTransportSocketIO<MsgToServer, MsgToClient>({
        codebaseVersionId,
        impl
      })
    }
  }
}
