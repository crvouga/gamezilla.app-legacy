import { call, cancel, delay, fork, race, take } from 'typed-redux-saga'
import { isErr, unwrapOr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
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

const saga = function* (input: { ctx: BackendCtxModule }) {
  yield fork(flowBackendInstanceState, input)
}

const flowBackendInstanceState = function* (input: { ctx: BackendCtxModule }) {
  const ctx = input.ctx
  const serverStartedChan = Sub.chan(Sub.where(ctx.httpServer.events, (e) => e.t === 'started'))
  const serverStoppingChan = Sub.chan(Sub.where(ctx.httpServer.events, (e) => e.t === 'stopped'))
  const runtimeStoppingChan = Sub.chan(Sub.where(ctx.runtime.events, (e) => e.t === 'runtime/stopping'))

  const event = yield* take(serverStartedChan)

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

  const hearbeatTask = yield* fork(flowHeartbeat, input)

  yield* race([take(serverStoppingChan), take(runtimeStoppingChan)])

  yield* cancel(hearbeatTask)

  ctx.logger.info(' server stopped. recording backend instance stopped')

  const backendInstanceStopped: BackendInstance = {
    ...backendInstanceStarted,
    stoppedAt: Posix.now(),
  }

  yield* call(ctx.backendInstanceDb.put, backendInstanceStopped)

  ctx.logger.info('recorded backend instance stopped')
}

const flowHeartbeat = function* (input: { ctx: BackendCtxModule }) {
  const ctx = input.ctx
  while (true) {
    ctx.logger.info('heartbeat')

    const got = yield* call(ctx.backendInstanceDb.get, ctx.backendInstanceId)

    ctx.logger.info('got', got)

    yield delay(TimeSpan.toMilliseconds(BackendInstance.HEARTBEAT))

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
  }
}

const rpc = (input: { ctx: BackendCtxModule }) => {
  return RPC.initServer(rpcContract, {
    'wire/backend-instance/list-alive': async () => {
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
