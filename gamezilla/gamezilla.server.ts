import { Posix, Program, isErr } from "gamezilla/@SHARED/core"
import * as AppServer from "./@CHILD/app/app.server"
import { ServerBun } from "./@SHARED/server-bun/server-bun"
import { PUBLIC_APP_CONFIG } from "config"
import { ServerTransportImpl } from "./@CHILD/app/@CHILD/wire/transport-server"
import http from "node:http"
import { LoggerConsole } from "./@CHILD/app/@SHARED/server/logger"

export type ServerImpl =
  | {
      t: "bun"
      serverBun: ServerBun
    }
  | {
      t: "node"
      httpServer: http.Server
    }

const ServerImpl = (): ServerImpl => {
  switch (PUBLIC_APP_CONFIG.SERVER_IMPL) {
    case "bun": {
      const serverBun = ServerBun()
      return {
        t: "bun",
        serverBun,
      }
    }
    case "node-and-socket-io": {
      const httpServer = new http.Server()
      return {
        t: "node",
        httpServer,
      }
    }
  }
}

const startServer = async ({
  serverImpl,
  port,
}: {
  port: number
  serverImpl: ServerImpl
}) => {
  switch (serverImpl.t) {
    case "bun": {
      serverImpl.serverBun.serve(port)
      break
    }
    case "node": {
      await new Promise((resolve) => {
        serverImpl.httpServer.listen(port, undefined, undefined, () => {
          resolve(null)
        })
      })
      break
    }
  }
}

const TransportImpl = ({
  serverImpl,
}: {
  serverImpl: ServerImpl
}): ServerTransportImpl => {
  switch (serverImpl.t) {
    case "bun": {
      return {
        t: "bun-web-sockets",
        serverBun: serverImpl.serverBun,
        webSocketEndpoint: PUBLIC_APP_CONFIG.WEB_SOCKETS_ENDPOINT,
      }
    }
    case "node": {
      return {
        t: "socket-io",
        serverPort: PUBLIC_APP_CONFIG.SERVER_PORT,
      }
    }
  }
}

const main = async () => {
  const serverImpl = ServerImpl()

  const transportImpl = TransportImpl({ serverImpl: serverImpl })

  const logger = LoggerConsole("app")

  const got = await AppServer.getDeps({ transportImpl, logger })

  if (isErr(got)) {
    logger.error(got.error)
    return
  }

  const deps = got.value

  const program = Program.create({
    getCtx: () => {
      return {
        now: Posix.now(),
      }
    },
    init: async ({ ctx }) => {
      const initial = await AppServer.init({
        ctx,
        deps,
      })

      return initial
    },

    update: async (input) => {
      const updated = await AppServer.update({
        ...input,
        deps,
      })

      return updated
    },

    subscriptions: async (input) => {
      const sub = await AppServer.subscriptions({
        ctx: input.ctx,
        model: input.model,
        deps,
      })

      return sub
    },

    onCrash: (e) => {
      console.error("Crashed!", e)
    },
  })

  program.start()

  await startServer({ serverImpl, port: PUBLIC_APP_CONFIG.SERVER_PORT })

  logger.info("Server started")
}

main()
