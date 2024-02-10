import { IServerTransport, ServerTransportImpl } from "./transport-server"
import { ServerTransportBunWebSockets } from "./transport-server-impl-bun-web-sockets"
import { ServerTransportSocketIO } from "./transport-server-impl-socket-io"

export const ServerTransport = <MsgToServer, MsgToClient>({
    impl,
    codebaseVersionId,
}: {
    impl: ServerTransportImpl
    codebaseVersionId: string
}): IServerTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
}> => {
    switch (impl.t) {
        case "bun-web-sockets": {
            return ServerTransportBunWebSockets<MsgToServer, MsgToClient>({
                codebaseVersionId,
                impl,
            })
        }

        case "socket-io": {
            return ServerTransportSocketIO<MsgToServer, MsgToClient>({
                codebaseVersionId,
                impl,
            })
        }
    }
}
