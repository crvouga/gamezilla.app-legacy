import { IServerTransport } from "./transport-server";
import { ServerTransportBunWebSockets } from "./transport-server-impl-bun-web-sockets";

export const ServerTransport = <ToServer, ToClient>({
  impl,
}: {
  impl: "bun-web-sockets";
}): IServerTransport<{
  ToServer: ToServer;
  ToClient: ToClient;
}> => {
  switch (impl) {
    case "bun-web-sockets": {
      return ServerTransportBunWebSockets<ToServer, ToClient>();
    }
  }
};
