import { ProgramImpure } from '@/core/program-impure'
import { RPC } from '@/rpc'
import { AppServer } from 'gamezilla-app/app/server'
import { CODEBASE_VERSION_ID, IS_PROD, SERVER_IMPL, SERVER_PORT, TRANSPORT_IMPL } from 'gamezilla-app/config-public'
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

  RPC.attachServer(ctx.server, AppTypes.rpcContract, rpc)

  ctx.logger.info({ CODEBASE_VERSION_ID, IS_PROD, SERVER_IMPL, TRANSPORT_IMPL })
}

main()
