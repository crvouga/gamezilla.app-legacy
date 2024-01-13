import { ClientTransportImpl, IClientTransport } from "./transport-client";
import { ClientTransportSocketIO } from "./transport-client-impl-socket-io";
import { ClientTransportWebSockets } from "./transport-client-impl-web-sockets";

export const ClientTransport = <ToServer, ToClient>({
  codebaseVersionId,
  impl,
}: {
  codebaseVersionId: string;
  impl: ClientTransportImpl;
}): IClientTransport<{ ToServer: ToServer; ToClient: ToClient }> => {
  switch (impl.t) {
    case "web-sockets": {
      return ClientTransportWebSockets<ToServer, ToClient>({
        codebaseVersionId,
        impl,
      });
    }

    case "socket-io": {
      return ClientTransportSocketIO<ToServer, ToClient>({
        codebaseVersionId,
        impl,
      });
    }
  }
};
