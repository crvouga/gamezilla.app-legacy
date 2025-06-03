import { p } from '~/@/promise'
import { Err, isErr, Result, unwrapOr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { BackendInstance } from '~/app/@/backend/backend-instance/backend-instance'
import { BackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { rpcContract, type BackendCtxModule } from './types'

const initCtx = async (input: { ctx: AppBackendCtxBase }): Promise<BackendCtxModule> => {
  const backendInstanceDb = BackendInstanceDb({
    t: 'key-value-db',
    keyValueDb: input.ctx.keyValueDbDurable,
  })

  return {
    ...input.ctx,
    backendInstanceDb,
  }
}

const worker = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  const ctx = input.ctx
  const msgsServerStarted = Sub.where(ctx.httpServer.events, (e) => e.t === 'started')
  const msgsServerStopped = Sub.where(ctx.httpServer.events, (e) => e.t === 'stopped')
  const msgsRuntimeStopping = Sub.where(ctx.runtime.events, (e) => e.t === 'runtime/stopping')

  const event = await Sub.take(msgsServerStarted, s)

  ctx.logger.info('server started. recording backend instance started')

  const backendInstanceStarted: BackendInstance = {
    backendInstanceId: ctx.backendInstanceId,
    ipAddress: event.ipAddress,
    lastHeartbeatAt: event.startedAt,
    port: event.port,
    startedAt: event.startedAt,
    stoppedAt: null,
  }

  await ctx.backendInstanceDb.put(backendInstanceStarted)

  ctx.logger.info('recorded backend instance started')

  await p.race(s, {
    serverStopped: (s) => Sub.take(msgsServerStopped, s),
    runtimeStopped: (s) => Sub.take(msgsRuntimeStopping, s),
    heartbeat: (s) => {
      workerHeartbeat(s, input)
      return p.neverResolve
    },
  })

  ctx.logger.info(' server stopped. recording backend instance stopped')

  const backendInstanceStopped: BackendInstance = {
    ...backendInstanceStarted,
    stoppedAt: Posix.now(),
  }

  await ctx.backendInstanceDb.put(backendInstanceStopped)

  ctx.logger.info('recorded backend instance stopped')
}

const workerHeartbeat = async (s: AbortSignal, input: { ctx: BackendCtxModule }) => {
  while (true) {
    await heartbeat(s, input)
    await p.sleep(BackendInstance.HEARTBEAT, s)
  }
}

const heartbeat = async (_s: AbortSignal, input: { ctx: BackendCtxModule }): Promise<Result<string, unknown>> => {
  const ctx = input.ctx
  ctx.logger.info('heartbeat')

  const got = await ctx.backendInstanceDb.get(ctx.backendInstanceId)

  if (isErr(got)) {
    ctx.logger.error('heartbeat error', got.error)
    return Err(got.error)
  }

  if (!got.value) {
    ctx.logger.error('backend instance not found')
    return Err('backend instance not found')
  }

  const backendInstanceNew: BackendInstance = {
    ...got.value,
    lastHeartbeatAt: Posix.now(),
  }

  const put = await ctx.backendInstanceDb.put(backendInstanceNew)

  if (isErr(put)) {
    ctx.logger.error('heartbeat error', put.error)
    return Err(put.error)
  }

  ctx.logger.info('heartbeat ok')

  return put
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
  worker,
  rpc,
}
