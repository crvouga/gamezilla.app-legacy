import { FileSystem } from '~/@/file-system'
import { withRPC } from '~/@/rpc/rpc'
import { withSinglePageApp } from '~/@/web-server/with-single-page-app'
import { AppServer } from '~/app/server'
import { IS_PROD, SERVER_IMPL, SERVER_PORT, TRANSPORT_IMPL } from '~/config-public'
import { ProgramImpure } from './@/program/program-impure'
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

  await ctx.webServer.start(SERVER_PORT)

  const rpc = AppServer.rpc({ ctx })

  withRPC({
    webServer: ctx.webServer,
    contract: AppTypes.rpcContract,
    handlers: rpc
  })

  withSinglePageApp({
    webServer: ctx.webServer,
    directory: 'dist',
    fileSystem: FileSystem({ t: 'bun' }),
    indexFile: 'index.html'
  })

  ctx.logger.info({
    IS_PROD,
    SERVER_IMPL,
    TRANSPORT_IMPL
  })
}

main()
