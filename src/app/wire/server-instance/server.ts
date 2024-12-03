import { Posix, Sub, Time, unwrapOr } from '@/core'
import { AppServerCtx } from 'app/@/server'
import { ServerInstance } from 'app/@/server/server-instance/server-instance'
import { ServerInstanceDb } from 'app/@/server/server-instance/server-instance-db'
import { rpcContract, type MsgServer, type ServerCtx, type ServerModule } from './types'
import { RPC } from '@/rpc'

const initCtx = async (input: { ctx: AppServerCtx }): Promise<ServerCtx> => {
  const serverInstanceDb = ServerInstanceDb({
    t: 'db-conn-kv',
    dbConnKv: input.ctx.dbConnKv
  })

  return {
    ...input.ctx,
    serverInstanceDb
  }
}

const update: ServerModule['update'] = async (input) => {
  switch (input.msg?.t) {
    case 'got-web-server-event': {
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

const subscriptions: ServerModule['subscriptions'] = async (input) => {
  return Sub.batch<MsgServer>([
    Sub.tag('got-web-server-event', input.ctx.server.events),
    Sub.tag('got-runtime-event', input.ctx.runtime.events),
    Time.interval(INTERVAL_ID, ServerInstance.HEARTBEAT, (at) => ({ t: 'heartbeat', at }))
  ])
}

const INTERVAL_ID = 'server-instance-heartbeat'

const rpc = (input: { ctx: ServerCtx }) => {
  return RPC.initServer(rpcContract, {
    async listAlive() {
      const listed = await input.ctx.serverInstanceDb.listAlive({
        minimalHeartRate: ServerInstance.HEARTBEAT
      })
      const serverInstances = unwrapOr(listed, [])
      return {
        serverInstances
      }
    }
  })
}

export const ServerInstanceServer = {
  initCtx,
  update,
  subscriptions,
  rpc
}
