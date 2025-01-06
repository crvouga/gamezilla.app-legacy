import { ProgramImpure } from '~/@/program/program-impure'
import { withRPC } from '~/@/rpc/rpc'
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

  ctx.webServer.registerHandler((_req) => {
    return new Response('Hello from gamezilla.app server', { status: 200, headers: { 'content-type': 'text/plain' } })
  })

  await ctx.webServer.start(SERVER_PORT)

  const rpc = AppServer.rpc({ ctx })

  withRPC({
    webServer: ctx.webServer,
    contract: AppTypes.rpcContract,
    handlers: rpc,
  })

  ctx.logger.info({
    IS_PROD,
    SERVER_IMPL,
    TRANSPORT_IMPL,
    SERVER_PORT,
  })
}

main()
