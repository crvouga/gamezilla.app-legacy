import { ServerBun } from "gamezilla/@SHARED/server/server-impl-bun/server-impl-bun"

export const StaticFileServerImplBun = ({ server }: { server: ServerBun }) => {
  server.registerFetchHandler(async (_request) => {
    return new Response("Hello, world!")
  })
}
