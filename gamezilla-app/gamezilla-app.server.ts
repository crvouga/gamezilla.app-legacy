import { IS_PROD, SERVER_IMPL, SERVER_PORT } from "gamezilla-app/public-config"
import * as AppServer from "./@CHILD/app/app.server"
import { ProgramImpure } from "./@SHARED/core/program-impure"
import { Server } from "./@SHARED/server"
import { ILogger, Logger } from "./@CHILD/app/@SHARED/server/logger"

const main = async () => {
  const server = Server(SERVER_IMPL)

  const logger = Logger({ t: "console" })

  const deps = await AppServer.getDeps({
    server,
    logger: ILogger.prefix("app", logger),
  })

  await ProgramImpure.run({
    ctx: AppServer.getCtx,

    init: (input) => AppServer.init({ ...input, deps }),

    update: (input) => AppServer.update({ ...input, model: null, deps }),

    subscriptions: (input) =>
      AppServer.subscriptions({ ...input, model: null, deps }),
  })

  await server.start(SERVER_PORT)

  logger.info(
    `Server started. Listening on port ${SERVER_PORT}. IS_PROD=${IS_PROD}`,
  )
}

main()
