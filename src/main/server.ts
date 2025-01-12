import { FileSystem } from '~/@/file-system'
import { ProgramImpure } from '~/@/program/program-impure'
import { withRPC } from '~/@/rpc/rpc'
import { withSinglePageApp } from '~/@/web-server/with-single-page-app'
import { AppTypes } from '~/app'
import { AppBackend } from '~/app/server'
import { SERVER_PORT } from '~/config/server'
import { IS_PROD, SERVER_IMPL, TRANSPORT_IMPL } from '~/config/shared'

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
    webBackend: ctx.webBackend,
    contract: AppTypes.rpcContract,
    handlers: AppBackend.rpc({ ctx }),
  })

  const SERVE_SINGLE_PAGE_APP = false

  if (SERVE_SINGLE_PAGE_APP) {
    withSinglePageApp({
      directory: 'dist',
      fileSystem: FileSystem({ t: 'bun' }),
      indexFile: 'index.html',
      webBackend: ctx.webBackend,
    })
  } else {
    ctx.webBackend.registerHandler((_request) => {
      return new Response('Hello from gamezilla.app server', { status: 200 })
    })
  }

  if (!SERVER_PORT) {
    throw new Error('SERVER_PORT is not set')
  }

  await ctx.webBackend.start(SERVER_PORT)

  ctx.logger.info({
    IS_PROD,
    SERVER_IMPL,
    TRANSPORT_IMPL,
    SERVER_PORT,
  })
}

main()
