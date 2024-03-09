import { ClientTransportImpl, IClientTransport } from "./transport-client"
import { ClientTransportSocketIO } from "./transport-client-impl-socket-io"
import { ClientTransportWebSockets } from "./transport-client-impl-web-sockets"

export const ClientTransport = async <MsgToServer, MsgToClient>({
  codebaseVersionId,
  impl,
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
    case "web-sockets": {
      return ClientTransportWebSockets<MsgToServer, MsgToClient>({
        codebaseVersionId,
        impl,
      })
    }

    case "socket-io": {
      return ClientTransportSocketIO<MsgToServer, MsgToClient>({
        codebaseVersionId,
        impl,
      })
    }
  }
}
