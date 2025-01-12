import { isErr, Ok, unwrapOr } from '~/@/result'
import { p } from '~/@/parser'
import { DbConnKv, IDbConnKv } from '../../../../../@/db-conn-kv'
import { BackendInstance } from '../server-instance'
import { BackendInstanceId } from '../server-instance-id'
import { IBackendInstanceDb } from './interface'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'

export type Config = {
  t: 'db-conn-kv'
  dbConnKv: IDbConnKv
}

export const BackendInstanceDb = (config: Config): IBackendInstanceDb => {
  const byId = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['server-instance-by-id'],
    parser: BackendInstance,
  })
  const ALL_IDS_KEY = 'all'
  const indexAllIds = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['server-instance-ids'],
    parser: p.arr(BackendInstanceId),
  })
  const list: IBackendInstanceDb['list'] = async () => {
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
  const get: IBackendInstanceDb['get'] = async (serverId) => {
    return byId.get(serverId)
  }
  const put: IBackendInstanceDb['put'] = async (serverInstance) => {
    const gotIds = await indexAllIds.get(ALL_IDS_KEY)
    const ids = unwrapOr(gotIds, null) ?? []
    const idsNew = Array.from(new Set([...ids, serverInstance.serverInstanceId]))
    const putIds = await indexAllIds.set(ALL_IDS_KEY, idsNew)
    if (isErr(putIds)) {
      return putIds
    }
    return byId.set(serverInstance.serverInstanceId, serverInstance)
  }
  const listAlive: IBackendInstanceDb['listAlive'] = async (input) => {
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
