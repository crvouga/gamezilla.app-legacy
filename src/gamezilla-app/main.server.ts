import { Posix } from 'gamezilla-app/@/core'
import { ProgramImpure } from 'gamezilla-app/@/core/program-impure'
import { Server } from 'gamezilla-app/@/server'
import { ILogger, Logger } from 'gamezilla-app/app/@/server/logger'
import * as AppServer from 'gamezilla-app/app/app.server'
import { MsgServer } from 'gamezilla-app/app/app.types'
import { CODEBASE_VERSION_ID, IS_PROD, SERVER_IMPL, SERVER_PORT, TRANSPORT_IMPL } from 'gamezilla-app/config'

const main = async () => {
  const logger = ILogger.prefix('app', Logger({ t: 'console' }))

  const server = Server({ t: SERVER_IMPL, logger: ILogger.prefix('server', logger) })

  const deps = await AppServer.initDeps({
    codebaseVersionId: CODEBASE_VERSION_ID,
    server,
    logger
  })

  await ProgramImpure.run<MsgServer, { now: Posix }>({
    initCtx: AppServer.initCtx,
    init: (input) => AppServer.init({ ...input, deps }),
    update: (input) => AppServer.update({ ...input, deps }),
    subscriptions: (input) => AppServer.subscriptions({ ...input, deps })
  })

  await server.start(SERVER_PORT)

  console.log({ CODEBASE_VERSION_ID, IS_PROD, SERVER_IMPL, TRANSPORT_IMPL })
}

main()
