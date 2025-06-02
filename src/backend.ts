import { runSaga } from 'redux-saga'
import { fork } from 'typed-redux-saga'
import { AppTypes } from '~/app'
import { AppBackend } from '~/app/backend'
import { CONFIG_BACKEND } from '~/config/backend'
import { RPC } from './@/rpc'
import { CONFIG_SHARED } from './config/shared'
import { PowerSyncBackendApp } from './service-powersync/backend/respond'

const main = async () => {
  const ctx = await AppBackend.initCtx()

  runSaga({}, function* () {
    yield fork(AppBackend.saga, { ctx })
  })

  RPC.registerRespond({
    httpServer: ctx.httpServer,
    contract: AppTypes.rpcContract,
    server: AppBackend.rpc({ ctx }),
  })

  PowerSyncBackendApp.registerRespond({
    ctx,
    httpServer: ctx.httpServer,
  })

  ctx.httpServer.registerRespond(() => {
    return new Response('Hello from gamezilla.app backend', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  })

  if (!CONFIG_BACKEND.SERVER_PORT) throw new Error('SERVER_PORT is not set')

  ctx.httpServer.start(CONFIG_BACKEND.SERVER_PORT)

  ctx.logger.info({ ...CONFIG_SHARED, ...CONFIG_BACKEND })
}

main()
