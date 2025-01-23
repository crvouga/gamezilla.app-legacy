import { KeyValueDb, type IKeyValueDb } from '~/@/db-conn-kv'
import { pipe } from '~/@/function/pipe'
import { LRUCache } from '~/@/least-recently-used-cache'
import { IRuntime } from '~/@/runtime'
import { TimeSpan } from '~/@/time/time-span'
import { ILogger, Logger } from '../../../../@/logger'
import * as ImplKeyValueDb from './impl-db-conn-kv'
import type { IProfileCache } from './interface'

export type Config = {
  t: 'cached-db-conn-kv'
  keyValueDb: IKeyValueDb
  logger: ILogger
  runtime: IRuntime
}

export const ProfileCache = async (config: Config): Promise<IProfileCache> => {
  const logger = Logger.prefix('profile-cache', config.logger)
  return ImplKeyValueDb.ProfileCache({
    t: 'db-conn-kv',
    keyValueDb: await pipe(
      config.keyValueDb,
      async (keyValueDb) =>
        KeyValueDb({
          t: 'with-throttled-writes',
          logger,
          keyValueDb,
          throttle: TimeSpan.seconds(10),
          runtime: config.runtime,
        }),
      async (keyValueDb) =>
        KeyValueDb({
          t: 'with-cache',
          logger,
          source: await keyValueDb,
          cache: await KeyValueDb({ t: 'hash-map', map: LRUCache({ maxCapacity: 100_000 }) }),
        }),
      async (keyValueDb) =>
        KeyValueDb({
          t: 'with-reduced-parsing',
          keyValueDb: await keyValueDb,
          logger,
          verifiedKeys: new Set(),
        }),
    ),
  })
}
