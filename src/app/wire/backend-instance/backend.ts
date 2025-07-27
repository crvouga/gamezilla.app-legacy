import { p } from '~/@/promise'
import { Err, isErr, Result } from '~/@/result'
import { Sub } from '~/@/sub'
import { UnixMs } from '~/@/time/unix-ms'
import { BackendInstance } from '~/app/@/backend/backend-instance/backend-instance'
import { BackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'
import { BackendInstanceId } from '~/app/@/backend/backend-instance/backend-instance-id'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { type BackendCtxModule } from './types'

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

  const backendInstanceId = BackendInstanceId.generate()

  ctx.logger.info('server started. recording backend instance started')

  const backendInstanceStarted: BackendInstance = {
    backendInstanceId,
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
      workerHeartbeat(s, { ...input, backendInstanceId })
      return p.neverResolve
    },
  })

  ctx.logger.info(' server stopped. recording backend instance stopped')

  const backendInstanceStopped: BackendInstance = {
    ...backendInstanceStarted,
    stoppedAt: UnixMs.now(),
  }

  await ctx.backendInstanceDb.put(backendInstanceStopped)

  ctx.logger.info('recorded backend instance stopped')
}

const workerHeartbeat = async (
  s: AbortSignal,
  input: { ctx: BackendCtxModule; backendInstanceId: BackendInstanceId },
) => {
  while (true) {
    await heartbeat(s, input)
    await p.sleep(BackendInstance.HEARTBEAT, s)
  }
}

const heartbeat = async (
  _s: AbortSignal,
  input: { ctx: BackendCtxModule; backendInstanceId: BackendInstanceId },
): Promise<Result<string, unknown>> => {
  const ctx = input.ctx
  ctx.logger.info('heartbeat')

  const got = await ctx.backendInstanceDb.get(input.backendInstanceId)

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
    lastHeartbeatAt: UnixMs.now(),
  }

  const put = await ctx.backendInstanceDb.put(backendInstanceNew)

  if (isErr(put)) {
    ctx.logger.error('heartbeat error', put.error)
    return Err(put.error)
  }

  ctx.logger.info('heartbeat ok')

  return put
}

export const BackendInstanceBackend = {
  initCtx,
  worker,
}
