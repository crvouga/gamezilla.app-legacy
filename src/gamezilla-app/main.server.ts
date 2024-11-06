import { ProgramImpure } from 'gamezilla-app/@/core/program-impure'
import * as AppServer from 'gamezilla-app/app/server'
import { MsgServer } from 'gamezilla-app/app/types'
import { CODEBASE_VERSION_ID, IS_PROD, SERVER_IMPL, SERVER_PORT, TRANSPORT_IMPL } from 'gamezilla-app/config-public'

const main = async () => {
  const ctx = await AppServer.initCtx()

  await ProgramImpure.run<MsgServer, AppServer.Ctx>({
    initCtx: async () => ctx,
    updateCtx: AppServer.updateCtx,
    init: AppServer.init,
    update: AppServer.update,
    subscriptions: AppServer.subscriptions
  })

  await ctx.server.start(SERVER_PORT)

  ctx.logger.info({ CODEBASE_VERSION_ID, IS_PROD, SERVER_IMPL, TRANSPORT_IMPL })
}

main()
