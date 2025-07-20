import { IDb } from '~/@/db/interface'
import { deterministicJsonStringify } from '~/@/json/deterministic-stringify'
import { IKeyValueDb, KeyValueDb } from '~/@/key-value-db'
import { ILogger } from '~/@/logger'
import { isOk } from '~/@/result'
import { PubSub } from '~/@/sub'
import { throttleByKeyDurable } from '~/@/throttle/throttle-by-key-durable'
import { TimeSpan } from '~/@/time/time-span'
import { QueryInput } from '../../interface/query-input/query-input'
import { QueryOutput } from '../../interface/query-output/query-output'
import { UpsertOutput } from '../../interface/upsert-output/upsert-output'

export type Msg<TEntity extends Record<string, unknown>, TRelated extends Record<string, unknown>> = {
  t: 'synced-remote-to-local'
  remoteQuery: QueryOutput<TEntity, TRelated>
  localUpsert: UpsertOutput<TEntity>
}

export type Config<TEntity extends Record<string, unknown>, TRelated extends Record<string, unknown>> = {
  t: 'one-way-sync-remote-to-local'
  logger: ILogger
  kvDb: IKeyValueDb
  remote: IDb.IDb<TEntity, TRelated>
  local: IDb.IDb<TEntity, TRelated>
  pubSub?: PubSub<Msg<TEntity, TRelated>>
  throttle: TimeSpan
  updateRelatedDbs?: (related: TRelated) => Promise<void>
}

export const Db = <TEntity extends Record<string, unknown>, TRelated extends Record<string, unknown>>(
  config: Config<TEntity, TRelated>,
): IDb.IDb<TEntity, TRelated> => {
  const kvDb = KeyValueDb.init({
    t: 'with-cache',
    source: config.kvDb,
    cache: KeyValueDb.init({ t: 'hash-map', map: new Map() }),
    logger: config.logger,
  })

  const remoteToLocalSync = throttleByKeyDurable<[QueryInput<TEntity>]>({
    kvDb,
    timeSpan: config.throttle,
    getKey: (query) => `${TimeSpan.toMilliseconds(config.throttle)}_${deterministicJsonStringify(query)}`,
    fn: async (query) => {
      const remoteQueried = await config.remote.query(query)
      const entities = isOk(remoteQueried) ? remoteQueried.value.entities.items : []

      const localUpsert = await config.local.upsert({ entities: entities })

      if (isOk(remoteQueried) && remoteQueried.value.related) {
        await config.updateRelatedDbs?.(remoteQueried.value.related)
      }

      config.pubSub?.pub({
        t: 'synced-remote-to-local',
        remoteQuery: remoteQueried,
        localUpsert,
      })
    },
  })
  return {
    ...config.local,
    liveQuery(query) {
      remoteToLocalSync(query)
      return config.local.liveQuery(query)
    },
    async query(query) {
      await remoteToLocalSync(query)
      return config.local.query(query)
    },
  }
}
