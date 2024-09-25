import { CODEBASE_VERSION_ID, SERVER_IMPL, SERVER_PORT } from 'gamezilla-app/config'
import { ProgramImpure } from './@/core/program-impure'
import { Server } from './@/server'
import { ILogger, Logger } from './app/@/server/logger'
import * as AppServer from './app/app.server'
import { Posix } from './@/core'
import { MsgServer } from './app/app.types'

const main = async () => {
  const logger = ILogger.prefix('app', Logger({ t: 'console' }))

  const server = Server({ t: SERVER_IMPL, logger: ILogger.prefix('server', logger) })

  const deps = await AppServer.initDeps({ codebaseVersionId: CODEBASE_VERSION_ID, server, logger })

  await ProgramImpure.run<MsgServer, { now: Posix }>({
    initCtx: AppServer.initCtx,
    init: (input) => AppServer.init({ ...input, deps }),
    update: (input) => AppServer.update({ ...input, deps }),
    subscriptions: (input) => AppServer.subscriptions({ ...input, deps })
  })

  await server.start(SERVER_PORT)

  server.serveSinglePageApp({
    directory: 'dist',
    indexFile: 'index.html'
  })
}

main()
