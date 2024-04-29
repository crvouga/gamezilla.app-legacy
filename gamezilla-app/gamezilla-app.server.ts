import { SERVER_IMPL, SERVER_PORT } from "gamezilla-app/public-config"
import { ILogger, Logger } from "./@CHILD/app/@SHARED/server/logger"
import * as AppServer from "./@CHILD/app/app.server"
import { ProgramImpure } from "./@SHARED/core/program-impure"
import { Server } from "./@SHARED/server"

const main = async () => {
  const logger = ILogger.prefix("app", Logger({ t: "console" }))

  const server = Server({
    t: SERVER_IMPL,
    logger: ILogger.prefix("server", logger),
  })

  const deps = await AppServer.getDeps({
    server,
    logger,
  })

  await ProgramImpure.run({
    getCtx: AppServer.getCtx,

    init: (input) => AppServer.init({ ...input, deps }),

    update: (input) => AppServer.update({ ...input, model: null, deps }),

    subscriptions: (input) =>
      AppServer.subscriptions({ ...input, model: null, deps }),
  })

  await server.start(SERVER_PORT)
}

main()
