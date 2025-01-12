import { unwrapOr } from '~/@/result'
import { RPC } from '~/@/rpc'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { Time } from '~/@/time/time'
import { AppBackendCtx } from '~/app/@/server/ctx'
import { BackendInstance } from '~/app/@/server/server-instance/server-instance'
import { BackendInstanceDb } from '~/app/@/server/server-instance/server-instance-db'
import { rpcContract, type MsgBackend, type BackendCtx, type BackendModule } from './types'

const initCtx = async (input: { ctx: AppBackendCtx }): Promise<BackendCtx> => {
  const serverInstanceDb = BackendInstanceDb({
    t: 'db-conn-kv',
    dbConnKv: input.ctx.dbConnKv,
  })

  return {
    ...input.ctx,
    serverInstanceDb,
  }
}

const update: BackendModule['update'] = async (input) => {
  switch (input.msg?.t) {
    case 'got-web-server-event': {
      switch (input.msg.c.t) {
        case 'web-server/started': {
          const serverInstanceNew: BackendInstance = {
            ipAddress: input.msg.c.ipAddress,
            lastHeartbeatAt: input.msg.c.startedAt,
            port: input.msg.c.port,
            serverInstanceId: input.ctx.serverInstanceId,
            startedAt: input.msg.c.startedAt,
            stoppedAt: null,
          }

          await input.ctx.serverInstanceDb.put(serverInstanceNew)

          input.ctx.logger.info('recorded server instance started')

          return {}
        }

        case 'web-server/stopping': {
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
      const got = unwrapOr(await input.ctx.serverInstanceDb.get(input.ctx.serverInstanceId), null)

      if (!got) {
        return {}
      }

      const serverInstanceNew: BackendInstance = {
        ...got,
        lastHeartbeatAt: input.msg.at,
      }

      await input.ctx.serverInstanceDb.put(serverInstanceNew)

      return {}
    }
  }
  return {}
}

const updateBackendStopped = async (input: { stoppedAt: Posix; ctx: BackendCtx }) => {
  const got = unwrapOr(await input.ctx.serverInstanceDb.get(input.ctx.serverInstanceId), null)

  if (!got) {
    return {}
  }

  const serverInstanceNew: BackendInstance = {
    ...got,
    stoppedAt: input.stoppedAt,
  }

  await input.ctx.serverInstanceDb.put(serverInstanceNew)

  input.ctx.logger.info('recorded server instance stopped')

  return {}
}

const subscriptions: BackendModule['subscriptions'] = async (input) => {
  return Sub.batch<MsgBackend>([
    Sub.tag('got-web-server-event', input.ctx.webBackend.events),
    Sub.tag('got-runtime-event', input.ctx.runtime.events),
    Time.interval(INTERVAL_ID, BackendInstance.HEARTBEAT, (at) => ({ t: 'heartbeat', at })),
  ])
}

const INTERVAL_ID = 'server-instance-heartbeat'

const rpc = (input: { ctx: BackendCtx }) => {
  return RPC.initBackend(rpcContract, {
    async listAlive() {
      const listed = await input.ctx.serverInstanceDb.listAlive({
        minimalHeartRate: BackendInstance.HEARTBEAT,
      })
      const serverInstances = unwrapOr(listed, [])
      return {
        serverInstances,
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
