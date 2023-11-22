import { ClientTransportImpl, IClientTransport } from "./transport-client";
import { ClientTransportWebSockets } from "./transport-client-impl-web-sockets";

export const ClientTransport = <ToServer, ToClient>({
  impl,
}: {
  impl: ClientTransportImpl;
}): IClientTransport<{ ToServer: ToServer; ToClient: ToClient }> => {
  switch (impl.t) {
    case "web-sockets": {
      return ClientTransportWebSockets<ToServer, ToClient>({
        impl,
      });
    }
  }
};
