import { Program } from "gamezilla-app/@SHARED/core"
import { IS_PROD, SERVER_IMPL, SERVER_PORT } from "gamezilla-app/public-config"
import { LoggerConsole } from "./@CHILD/app/@SHARED/server/logger"
import * as AppServer from "./@CHILD/app/app.server"
import { Server } from "./@SHARED/server"

const main = async () => {
  const server = Server(SERVER_IMPL)

  const logger = LoggerConsole("app")

  const deps = await AppServer.getDeps({
    server,
    logger,
  })

  await Program.run({
    ctx: AppServer.getCtx,

    init: (input) => AppServer.init({ ...input, deps }),

    update: (input) => AppServer.update({ ...input, deps }),

    subscriptions: (input) => AppServer.subscriptions({ ...input, deps }),
  })

  await server.start(SERVER_PORT)

  logger.info(
    `Server started. Listening on port ${SERVER_PORT}. IS_PROD=${IS_PROD}`,
  )
}

main()
