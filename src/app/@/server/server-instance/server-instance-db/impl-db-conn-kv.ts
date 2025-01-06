import { isErr, Ok, unwrapOr } from '~/@/result'
import { p } from '~/@/parser'
import { DbConnKv, IDbConnKv } from '../../../../../@/db-conn-kv'
import { ServerInstance } from '../server-instance'
import { ServerInstanceId } from '../server-instance-id'
import { IServerInstanceDb } from './interface'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
}

export const ServerInstanceDb = (config: Config): IServerInstanceDb => {
  const byId = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['server-instance-by-id'],
    parser: ServerInstance,
  })
  const ALL_IDS_KEY = 'all'
  const indexAllIds = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['server-instance-ids'],
    parser: p.arr(ServerInstanceId),
  })
  const list: IServerInstanceDb['list'] = async () => {
    const got = await indexAllIds.get(ALL_IDS_KEY)
    if (isErr(got)) {
      return got
    }
    const ids = got.value ?? []
    const gotAll = await byId.getMany(ids)
    if (isErr(gotAll)) {
      return gotAll
    }
    return Ok(gotAll.value)
  }
  const get: IServerInstanceDb['get'] = async (serverId) => {
    return byId.get(serverId)
  }
  const put: IServerInstanceDb['put'] = async (serverInstance) => {
    const gotIds = await indexAllIds.get(ALL_IDS_KEY)
    const ids = unwrapOr(gotIds, null) ?? []
    const idsNew = Array.from(new Set([...ids, serverInstance.serverInstanceId]))
    const putIds = await indexAllIds.set(ALL_IDS_KEY, idsNew)
    if (isErr(putIds)) {
      return putIds
    }
    return byId.set(serverInstance.serverInstanceId, serverInstance)
  }
  const listAlive: IServerInstanceDb['listAlive'] = async (input) => {
    const listed = unwrapOr(await list(), [])
    const alive = listed
      .filter((serverInstance) => {
        const heartRate = Posix.diff(serverInstance.lastHeartbeatAt, Posix.now())
        return TimeSpan.lte(heartRate, input.minimalHeartRate)
      })
      .filter((serverInstance) => {
        return serverInstance.stoppedAt === null
      })
    return Ok(alive)
  }
  return {
    listAlive,
    list,
    get,
    put,
  }
}
