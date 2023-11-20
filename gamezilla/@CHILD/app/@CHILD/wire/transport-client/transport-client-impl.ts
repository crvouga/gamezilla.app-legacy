import { IClientTransport } from "./transport-client";
import { ClientTransportWebSockets } from "./transport-client-impl-web-sockets";

export const ClientTransport = <ToServer, ToClient>({
  impl,
}: {
  impl: "web-sockets";
}): IClientTransport<{ ToServer: ToServer; ToClient: ToClient }> => {
  switch (impl) {
    case "web-sockets": {
      return ClientTransportWebSockets<ToServer, ToClient>();
    }
  }
};
