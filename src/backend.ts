import { ProgramImpure } from '~/@/program/program-impure'
import { AppTypes } from '~/app'
import { AppBackend } from '~/app/backend'
import { CONFIG_BACKEND } from '~/config/backend'
import { HealthCheck } from './@/health-check/health-check'
import { RPC } from './@/wire-rpc'
import { PowerSyncBackendApp } from './service-powersync/backend/respond'
import { CONFIG_SHARED } from './config/shared'

const main = async () => {
  const ctx = await AppBackend.initCtx()

  await ProgramImpure.run({
    initCtx: async () => ctx,
    updateCtx: AppBackend.updateCtx,
    init: AppBackend.init,
    update: AppBackend.update,
    subscriptions: AppBackend.subscriptions,
    crash: (input) => console.error('program crashed!', input.error),
  })

  RPC.registerRespond({
    httpServer: ctx.httpServer,
    contract: AppTypes.rpcContract,
    server: AppBackend.rpc({ ctx }),
  })

  PowerSyncBackendApp.registerRespond({
    httpServer: ctx.httpServer,
    ctx: { userSessionDb: ctx.auth.userSessionDb },
  })

  HealthCheck.registerRespond({
    httpServer: ctx.httpServer,
  })

  ctx.httpServer.registerRespond((_request) => {
    return new Response('Hello from gamezilla.app backend', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  })

  if (!CONFIG_BACKEND.SERVER_PORT) throw new Error('SERVER_PORT is not set')

  await ctx.httpServer.start(CONFIG_BACKEND.SERVER_PORT)

  ctx.logger.info({ ...CONFIG_SHARED, ...CONFIG_BACKEND })
}

main()
