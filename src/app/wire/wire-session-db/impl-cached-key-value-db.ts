import { LRUCache } from '~/@/least-recently-used-cache'
import { KeyValueDb, IKeyValueDb } from '~/@/key-value-db'
import { ILogger, Logger } from '~/@/logger'
import { PubSub } from '~/@/pub-sub'
import { IPubSubTopicBased } from '~/@/pub-sub-topic-based'
import * as ImplKeyValueDb from './impl-key-value-db'
import type { IWireSessionDb } from './interface'

export type Config = {
  t: 'cached-key-value-db'
  keyValueDb: IKeyValueDb
  logger: ILogger
  pubSubTopicBased: IPubSubTopicBased
}

export const WireSessionDb = async (config: Config): Promise<IWireSessionDb> => {
  const logger = Logger.prefix('impl-cached-key-value-db', config.logger)

  const cache = await KeyValueDb({
    t: 'with-distributed-invalidations',
    logger,
    pubSub: await PubSub({
      t: 'pub-sub-topic-based',
      pubSubTopicBased: config.pubSubTopicBased,
      topic: 'wire-session-db-cache-invalidation',
    }),
    cache: await KeyValueDb({
      t: 'hash-map',
      map: LRUCache({
        maxCapacity: 2000,
      }),
    }),
  })

  const keyValueDb = await KeyValueDb({
    t: 'with-reduced-parsing',
    keyValueDb: await KeyValueDb({
      t: 'with-cache',
      logger,
      source: config.keyValueDb,
      cache,
    }),
    verifiedKeys: new Set(),
    logger,
  })

  return ImplKeyValueDb.WireSessionDb({ t: 'key-value-db', keyValueDb, logger })
}
