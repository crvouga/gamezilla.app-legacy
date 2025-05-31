import { call, delay, fork, race, take } from 'typed-redux-saga'
import { isErr, unwrapOr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { BackendInstance } from '~/app/@/backend/backend-instance/backend-instance'
import { BackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { rpcContract, type BackendCtxModule } from './types'

const initCtx = async (input: { ctx: AppBackendCtxBase }): Promise<BackendCtxModule> => {
  const backendInstanceDb = BackendInstanceDb({
    t: 'key-value-db',
    keyValueDb: input.ctx.keyValueDb,
  })

  return {
    ...input.ctx,
    backendInstanceDb,
  }
}

const saga = function* (ctx: BackendCtxModule) {
  yield fork(flowHeartbeat, ctx)
  yield fork(flowBackendInstanceState, ctx)
}

const flowBackendInstanceState = function* (ctx: BackendCtxModule) {
  const httpServerStarted = ctx.httpServer.events.where((e) => e.t === 'http-server/started').chan()
  const httpServerStopped = ctx.httpServer.events.where((e) => e.t === 'http-server/stopping').chan()
  const runtimeStopping = ctx.runtime.events.where((e) => e.t === 'runtime/stopping').chan()

  const event = yield* take(httpServerStarted)

  ctx.logger.info('server started. recording backend instance started')

  const backendInstanceStarted: BackendInstance = {
    backendInstanceId: ctx.backendInstanceId,
    ipAddress: event.ipAddress,
    lastHeartbeatAt: event.startedAt,
    port: event.port,
    startedAt: event.startedAt,
    stoppedAt: null,
  }

  yield* call(ctx.backendInstanceDb.put, backendInstanceStarted)

  ctx.logger.info('recorded backend instance started')

  yield* race([take(httpServerStopped), take(runtimeStopping)])

  ctx.logger.info(' server stopped. recording backend instance stopped')

  const backendInstanceStopped: BackendInstance = {
    ...backendInstanceStarted,
    stoppedAt: Posix.now(),
  }

  yield* call(ctx.backendInstanceDb.put, backendInstanceStopped)

  ctx.logger.info('recorded backend instance stopped')
}

const flowHeartbeat = function* (ctx: BackendCtxModule) {
  while (true) {
    ctx.logger.info('heartbeat')

    const got = yield* call(ctx.backendInstanceDb.get, ctx.backendInstanceId)

    ctx.logger.info('got', got)

    if (isErr(got)) continue

    ctx.logger.info('got.value', got.value)

    if (!got.value) continue

    ctx.logger.info('got.value', got.value)

    const backendInstanceNew: BackendInstance = {
      ...got.value,
      lastHeartbeatAt: Posix.now(),
    }

    ctx.logger.info('backendInstanceNew', backendInstanceNew)

    const put = yield* call(ctx.backendInstanceDb.put, backendInstanceNew)

    ctx.logger.info('put', put)

    if (isErr(put)) continue

    ctx.logger.info('put.value', put.value)

    ctx.logger.info('heartbeat ok')

    yield delay(TimeSpan.toMilliseconds(BackendInstance.HEARTBEAT))
  }
}

const rpc = (input: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    async listAlive() {
      const listed = await input.ctx.backendInstanceDb.listAlive({
        minimalHeartRate: BackendInstance.HEARTBEAT,
      })
      const backendInstances = unwrapOr(listed, [])
      return {
        backendInstances,
      }
    },
  })
}

export const BackendInstanceBackend = {
  initCtx,
  saga,
  rpc,
}
