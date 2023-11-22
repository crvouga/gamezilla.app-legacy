import { IServerTransport, ServerTransportImpl } from "./transport-server";
import { ServerTransportBunWebSockets } from "./transport-server-impl-bun-web-sockets";

export const ServerTransport = <ToServer, ToClient>({
  impl,
}: {
  impl: ServerTransportImpl;
}): IServerTransport<{
  ToServer: ToServer;
  ToClient: ToClient;
}> => {
  switch (impl.t) {
    case "bun-web-sockets": {
      return ServerTransportBunWebSockets<ToServer, ToClient>({
        impl,
      });
    }
  }
};
