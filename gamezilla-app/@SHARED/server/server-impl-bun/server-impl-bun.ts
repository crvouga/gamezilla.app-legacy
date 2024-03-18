import { Server, WebSocketHandler } from "bun"
import { IServer } from "../server"

type FetchHandler = (
  req: Request,
  server: Server,
) => MaybePromise<Response | undefined | null>

type MaybePromise<T> = T | Promise<T>

export const ServerBun = <T>() => {
  const fetchHandlers: FetchHandler[] = []
  let webSocketHandler: WebSocketHandler<T>
  let server: Server
  const base: IServer = {
    async start(port) {
      server = Bun.serve({
        port: port,
        async fetch(req, server) {
          for (const handler of fetchHandlers) {
            const response = await handler(req, server)
            if (response) {
              return response
            }
          }
          return new Response("Not found", { status: 404 })
        },
        websocket: webSocketHandler,
      })
    },
    registerHandler(_handler) {
      throw new Error("registerHandler not implemented for bun server")
    },
    serveSinglePageApp(_input) {
      throw new Error(
        "serveSinglePageApp not implemented for bun server. Will not work when deployed",
      )
    },
  }
  return {
    ...base,
    registerFetchHandler(fetch: FetchHandler) {
      fetchHandlers.push(fetch)
    },
    setWebSocketHandler(handler: WebSocketHandler<T>) {
      webSocketHandler = handler
    },
    publish(topic: string, data: string) {
      server.publish(topic, data)
    },
    t: "bun",
  } as const
}

export type ServerBun = ReturnType<typeof ServerBun>
