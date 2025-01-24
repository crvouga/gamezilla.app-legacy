import { ProgramImpure } from '~/@/program/program-impure'
import { withRPC } from '~/@/rpc/rpc'
import { AppTypes } from '~/app'
import { AppBackend } from '~/app/backend'
import { CONFIG_BACKEND } from '~/config/backend'
import { PowerSyncBackendApp } from './service-powersync/backend/respond'

const ctx = await AppBackend.initCtx()

await ProgramImpure.run<AppTypes.MsgBackend, AppTypes.BackendCtx>({
  initCtx: async () => ctx,
  updateCtx: AppBackend.updateCtx,
  init: AppBackend.init,
  update: AppBackend.update,
  subscriptions: AppBackend.subscriptions,
  crash(input) {
    console.error('program crashed!', input.error)
  },
})

withRPC({
  httpServer: ctx.httpServer,
  contract: AppTypes.rpcContract,
  handlers: AppBackend.rpc({ ctx }),
})

PowerSyncBackendApp.withHandlers({
  httpServer: ctx.httpServer,
  ctx: { userSessionDb: ctx.auth.userSessionDb },
})

ctx.httpServer.registerRespond((request) => {
  const pathname = new URL(request.url).pathname
  switch (pathname) {
    case '/health': {
      return new Response('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      })
    }
    default: {
      return null
    }
  }
})

ctx.httpServer.registerRespond((_request) => {
  return new Response('Hello from gamezilla.app backend', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
})

if (!CONFIG_BACKEND.SERVER_PORT) {
  throw new Error('SERVER_PORT is not set')
}

await ctx.httpServer.start(CONFIG_BACKEND.SERVER_PORT)

ctx.logger.info({
  SERVER_PORT: CONFIG_BACKEND.SERVER_PORT,
})
