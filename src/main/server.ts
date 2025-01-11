import { FileSystem } from '~/@/file-system'
import { ProgramImpure } from '~/@/program/program-impure'
import { withRPC } from '~/@/rpc/rpc'
import { withSinglePageApp } from '~/@/web-server/with-single-page-app'
import { AppTypes } from '~/app'
import { AppServer } from '~/app/server'
import { SERVER_PORT } from '~/config/server'
import { IS_PROD, SERVER_IMPL, TRANSPORT_IMPL } from '~/config/shared'

const main = async () => {
  const ctx = await AppServer.initCtx()

  await ProgramImpure.run<AppTypes.MsgServer, AppTypes.ServerCtx>({
    initCtx: async () => ctx,
    updateCtx: AppServer.updateCtx,
    init: AppServer.init,
    update: AppServer.update,
    subscriptions: AppServer.subscriptions,
  })

  withRPC({
    webServer: ctx.webServer,
    contract: AppTypes.rpcContract,
    handlers: AppServer.rpc({ ctx }),
  })

  withSinglePageApp({
    directory: 'dist',
    fileSystem: FileSystem({ t: 'bun' }),
    indexFile: 'index.html',
    webServer: ctx.webServer,
  })

  if (!SERVER_PORT) {
    throw new Error('SERVER_PORT is not set')
  }

  await ctx.webServer.start(SERVER_PORT)

  ctx.logger.info({
    IS_PROD,
    SERVER_IMPL,
    TRANSPORT_IMPL,
    SERVER_PORT,
  })
}

main()
