import { withRPC } from '~/@/rpc/rpc'
import { AppServer } from '~/app/server'
import { IS_PROD, SERVER_IMPL, TRANSPORT_IMPL } from '~/config-public'
import { Compress } from './@/compress'
import { FileSystem } from './@/file-system'
import { ProgramImpure } from './@/program/program-impure'
import { withSinglePageApp } from './@/web-server/with-single-page-app'
import { AppTypes } from './app'
import { SERVER_PORT } from './config-private'

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
    fileSystem: FileSystem({ t: 'bun' }),
    compress: Compress({ t: 'bun' }),
    webServer: ctx.webServer,
    directory: './dist',
    indexFile: 'index.html'
  })

  ctx.logger.info({
    IS_PROD,
    SERVER_IMPL,
    TRANSPORT_IMPL,
    SERVER_PORT
  })
}

main()
