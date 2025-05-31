import { AppTypes } from '~/app'
import { AppBackend } from '~/app/backend'
import { CONFIG_BACKEND } from '~/config/backend'
import { HealthCheck } from './@/health-check/health-check'
import { RPC } from './@/rpc'
import { PubSub } from './@/sub'
import { CONFIG_SHARED } from './config/shared'
import { PowerSyncBackendApp } from './service-powersync/backend/respond'

import { runSaga, stdChannel } from 'redux-saga'
import { fork } from 'redux-saga/effects'

const pubSub = PubSub.create<unknown>()
const channel = stdChannel<any>()
pubSub.sub((msg) => channel.put(msg))

const myIO = {
  channel,
  dispatch(msg: unknown) {
    pubSub.pub(msg)
  },
  getState() {
    return {}
  },
}
const main = async () => {
  const ctx = await AppBackend.initCtx()

  runSaga(myIO, function* () {
    yield fork(AppBackend.saga, ctx)
  })

  RPC.registerRespond({
    httpServer: ctx.httpServer,
    contract: AppTypes.rpcContract,
    server: AppBackend.rpc(ctx),
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
