import { Posix, Sub, Time, unwrapOr } from 'gamezilla-app/@/core'
import { AppServerCtx } from '../@/server'
import { ServerInstance } from '../@/server/server-instance/server-instance'
import { ServerInstanceDb } from '../@/server/server-instance/server-instance-db'
import type { MsgServer, ServerCtx, ServerModule } from './types'

export const initCtx = (input: { ctx: AppServerCtx }): ServerCtx => {
  const serverInstanceDb = ServerInstanceDb({
    t: 'db-conn-kv',
    dbConnKv: input.ctx.dbConnKv
  })

  return {
    ...input.ctx,
    serverInstanceDb
  }
}

export const update: ServerModule['update'] = async (input) => {
  switch (input.msg?.t) {
    case 'got-server-event': {
      switch (input.msg.c.t) {
        case 'web-server/started': {
          const serverInstanceNew: ServerInstance = {
            ipAddress: input.msg.c.ipAddress,
            lastHeartbeatAt: input.msg.c.startedAt,
            port: input.msg.c.port,
            serverInstanceId: input.ctx.serverInstanceId,
            startedAt: input.msg.c.startedAt,
            stoppedAt: null
          }

          await input.ctx.serverInstanceDb.put(serverInstanceNew)

          input.ctx.logger.info('recorded server instance started')

          return {}
        }

        case 'web-server/stopping': {
          return updateServerStopped({ ctx: input.ctx, stoppedAt: input.msg.c.stoppedAt })
        }
      }
    }

    case 'got-runtime-event': {
      switch (input.msg.c.t) {
        case 'stopping': {
          return updateServerStopped({ ctx: input.ctx, stoppedAt: input.msg.c.stoppedAt })
        }
      }
    }

    case 'heartbeat': {
      const got = unwrapOr(await input.ctx.serverInstanceDb.get(input.ctx.serverInstanceId), null)

      if (!got) {
        return {}
      }

      const serverInstanceNew: ServerInstance = {
        ...got,
        lastHeartbeatAt: input.msg.at
      }

      await input.ctx.serverInstanceDb.put(serverInstanceNew)

      return {}
    }
  }
  return {}
}

const updateServerStopped = async (input: { stoppedAt: Posix; ctx: ServerCtx }) => {
  const got = unwrapOr(await input.ctx.serverInstanceDb.get(input.ctx.serverInstanceId), null)

  if (!got) {
    return {}
  }

  const serverInstanceNew: ServerInstance = {
    ...got,
    stoppedAt: input.stoppedAt
  }

  await input.ctx.serverInstanceDb.put(serverInstanceNew)

  input.ctx.logger.info('recorded server instance stopped')

  return {}
}

export const subscriptions: ServerModule['subscriptions'] = async (input) => {
  return Sub.batch<MsgServer>([
    Sub.tag('got-server-event', input.ctx.server.events),
    Sub.tag('got-runtime-event', input.ctx.runtime.events),
    Time.interval('server-instance-heartbeat', ServerInstance.HEARTBEAT, (at) => ({ t: 'heartbeat', at }))
  ])
}
