import { unwrapOr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Time } from '~/@/time/time'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendInstance } from '~/app/@/backend/backend-instance/backend-instance'
import { BackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'
import { rpcContract, type MsgBackend, type BackendCtx, type BackendModule } from './types'

const initCtx = async (input: { ctx: AppBackendCtx }): Promise<BackendCtx> => {
  const backendInstanceDb = BackendInstanceDb({
    t: 'db-conn-kv',
    dbConnKv: input.ctx.dbConnKv,
  })

  return {
    ...input.ctx,
    backendInstanceDb,
  }
}

const update: BackendModule['update'] = async (input) => {
  switch (input.msg?.t) {
    case 'got-web-backend-event': {
      switch (input.msg.c.t) {
        case 'web-backend/started': {
          const backendInstanceNew: BackendInstance = {
            ipAddress: input.msg.c.ipAddress,
            lastHeartbeatAt: input.msg.c.startedAt,
            port: input.msg.c.port,
            backendInstanceId: input.ctx.backendInstanceId,
            startedAt: input.msg.c.startedAt,
            stoppedAt: null,
          }

          await input.ctx.backendInstanceDb.put(backendInstanceNew)

          input.ctx.logger.info('recorded backend instance started')

          return {}
        }

        case 'web-backend/stopping': {
          return updateBackendStopped({ ctx: input.ctx, stoppedAt: input.msg.c.stoppedAt })
        }
      }
    }

    case 'got-runtime-event': {
      switch (input.msg.c.t) {
        case 'stopping': {
          return updateBackendStopped({ ctx: input.ctx, stoppedAt: input.msg.c.stoppedAt })
        }
      }
    }

    case 'heartbeat': {
      const got = unwrapOr(await input.ctx.backendInstanceDb.get(input.ctx.backendInstanceId), null)

      if (!got) {
        return {}
      }

      const backendInstanceNew: BackendInstance = {
        ...got,
        lastHeartbeatAt: input.msg.at,
      }

      await input.ctx.backendInstanceDb.put(backendInstanceNew)

      return {}
    }
  }
  return {}
}

const updateBackendStopped = async (input: { stoppedAt: Posix; ctx: BackendCtx }) => {
  const got = unwrapOr(await input.ctx.backendInstanceDb.get(input.ctx.backendInstanceId), null)

  if (!got) {
    return {}
  }

  const backendInstanceNew: BackendInstance = {
    ...got,
    stoppedAt: input.stoppedAt,
  }

  await input.ctx.backendInstanceDb.put(backendInstanceNew)

  input.ctx.logger.info('recorded backend instance stopped')

  return {}
}

const subscriptions: BackendModule['subscriptions'] = async (input) => {
  return Sub.batch<MsgBackend>([
    Sub.tag('got-web-backend-event', input.ctx.httpServer.events),
    Sub.tag('got-runtime-event', input.ctx.runtime.events),
    Time.interval(INTERVAL_ID, BackendInstance.HEARTBEAT, (at) => ({ t: 'heartbeat', at })),
  ])
}

const INTERVAL_ID = 'backend-instance-heartbeat'

const rpc = (input: { ctx: BackendCtx }) => {
  return RPC.initBackend(rpcContract, {
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
  update,
  subscriptions,
  rpc,
}
