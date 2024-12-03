import { ProgramImpure } from '@/core/program-impure'
import { FileSystem } from '@/file-system'
import { withRPC } from '@/rpc/rpc'
import { withSinglePageApp } from '@/web-server/with-single-page-app'
import { AppServer } from 'app/server'
import { CODEBASE_VERSION_ID, IS_PROD, SERVER_IMPL, SERVER_PORT, TRANSPORT_IMPL } from 'config-public'
import { AppTypes } from './app'

const main = async () => {
  const ctx = await AppServer.initCtx()

  await ProgramImpure.run<AppTypes.MsgServer, AppTypes.ServerCtx>({
    initCtx: async () => ctx,
    updateCtx: AppServer.updateCtx,
    init: AppServer.init,
    update: AppServer.update,
    subscriptions: AppServer.subscriptions
  })

  await ctx.server.start(SERVER_PORT)

  const rpc = AppServer.rpc({ ctx })

  withRPC({
    webServer: ctx.server,
    contract: AppTypes.rpcContract,
    handlers: rpc
  })

  withSinglePageApp({
    webServer: ctx.server,
    directory: 'dist',
    fileSystem: FileSystem({ t: 'bun' }),
    indexFile: 'index.html'
  })

  ctx.logger.info({
    CODEBASE_VERSION_ID,
    IS_PROD,
    SERVER_IMPL,
    TRANSPORT_IMPL
  })
}

main()
