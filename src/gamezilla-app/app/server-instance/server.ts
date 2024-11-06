import { AppServerCtx } from '../@/server'
import { ServerInstance } from '../@/server/server-instance/server-instance'
import { ServerInstanceDb } from '../@/server/server-instance/server-instance-db'
import { ServerInstanceId } from '../@/server/server-instance/server-instance-id'
import type { ServerCtx, ServerModule } from './types'

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
  switch (input.msgEvt?.t) {
    case 'server/started': {
      const serverInstanceNew: ServerInstance = {
        ipAddress: input.msgEvt.ipAddress,
        lastHeartbeatAt: input.msgEvt.startedAt,
        port: input.msgEvt.port,
        serverInstanceId: ServerInstanceId.generate(),
        startedAt: input.msgEvt.startedAt,
        stoppedAt: null
      }
      await input.ctx.serverInstanceDb.put(serverInstanceNew)
      return {}
    }
  }
  return {}
}
