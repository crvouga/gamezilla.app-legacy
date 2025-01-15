import { FileSystem } from '~/@/file-system'
import { withSinglePageApp } from '~/@/http-server/with-single-page-app'
import { ProgramImpure } from '~/@/program/program-impure'
import { withRPC } from '~/@/rpc/rpc'
import { AppTypes } from '~/app'
import { AppBackend } from '~/app/backend'
import { CONFIG_BACKEND } from '~/config/backend'

const main = async () => {
  const ctx = await AppBackend.initCtx()

  await ProgramImpure.run<AppTypes.MsgBackend, AppTypes.BackendCtx>({
    initCtx: async () => ctx,
    updateCtx: AppBackend.updateCtx,
    init: AppBackend.init,
    update: AppBackend.update,
    subscriptions: AppBackend.subscriptions,
  })

  withRPC({
    httpServer: ctx.httpServer,
    contract: AppTypes.rpcContract,
    handlers: AppBackend.rpc({ ctx }),
  })

  const SERVE_SINGLE_PAGE_APP = false

  if (SERVE_SINGLE_PAGE_APP) {
    withSinglePageApp({
      directory: 'dist',
      fileSystem: FileSystem({ t: 'bun' }),
      indexFile: 'index.html',
      httpServer: ctx.httpServer,
    })
  } else {
    ctx.httpServer.registerHandler((_request) => {
      return new Response('Hello from gamezilla.app backend', { status: 200 })
    })
  }

  if (!CONFIG_BACKEND.SERVER_PORT) {
    throw new Error('SERVER_PORT is not set')
  }

  await ctx.httpServer.start(CONFIG_BACKEND.SERVER_PORT)

  ctx.logger.info(CONFIG_BACKEND)
}

main()
