import { isErr, Ok, unwrapOr } from '~/@/result'
import { p } from '~/@/parser'
import { DbConnKv, IDbConnKv } from '../../../../../@/db-conn-kv'
import { BackendInstance } from '../backend-instance'
import { BackendInstanceId } from '../backend-instance-id'
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
    namespace: ['backend-instance-by-id'],
    parser: BackendInstance,
  })
  const ALL_IDS_KEY = 'all'
  const indexAllIds = DbConnKv.withNamespace({
    dbConnKv: config.dbConnKv,
    namespace: ['backend-instance-ids'],
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
  const get: IBackendInstanceDb['get'] = async (backendId) => {
    return byId.get(backendId)
  }
  const put: IBackendInstanceDb['put'] = async (backendInstance) => {
    const gotIds = await indexAllIds.get(ALL_IDS_KEY)
    const ids = unwrapOr(gotIds, null) ?? []
    const idsNew = Array.from(new Set([...ids, backendInstance.backendInstanceId]))
    const putIds = await indexAllIds.set(ALL_IDS_KEY, idsNew)
    if (isErr(putIds)) {
      return putIds
    }
    return byId.set(backendInstance.backendInstanceId, backendInstance)
  }
  const listAlive: IBackendInstanceDb['listAlive'] = async (input) => {
    const listed = unwrapOr(await list(), [])
    const alive = listed
      .filter((backendInstance) => {
        const heartRate = Posix.diff(backendInstance.lastHeartbeatAt, Posix.now())
        return TimeSpan.lte(heartRate, input.minimalHeartRate)
      })
      .filter((backendInstance) => {
        return backendInstance.stoppedAt === null
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
