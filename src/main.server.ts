import { withRPC } from '~/@/rpc/rpc'
import { AppServer } from '~/app/server'
import { IS_PROD, SERVER_IMPL, TRANSPORT_IMPL } from '~/config-public'
import { ProgramImpure } from './@/program/program-impure'
import { AppTypes } from './app'
import { SERVER_PORT } from './config-private'

const main = async () => {
  const ctx = await AppServer.initCtx()

  await ProgramImpure.run<AppTypes.MsgServer, AppTypes.ServerCtx>({
    initCtx: async () => ctx,
    updateCtx: AppServer.updateCtx,
    init: AppServer.init,
    update: AppServer.update,
    subscriptions: AppServer.subscriptions,
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
