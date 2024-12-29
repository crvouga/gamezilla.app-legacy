import { TimeSpan, pipe } from '~/@/core'
import { LRUCache } from '~/@/least-recently-used-cache'
import { IRuntime } from '~/@/runtime'
import { DbConnKv, type IDbConnKv } from '~/@/db-conn-kv'
import { ILogger, Logger } from '../../../../@/logger'
import * as ImplDbConnKv from './impl-db-conn-kv'
import type { IProfileCache } from './interface'

export type Config = {
  t: 'cached-db-conn-kv'
  dbConnKv: IDbConnKv
  logger: ILogger
  runtime: IRuntime
}

export const ProfileCache = async (config: Config): Promise<IProfileCache> => {
  const logger = Logger.prefix('profile-cache', config.logger)
  return ImplDbConnKv.ProfileCache({
    t: 'db-conn-kv',
    dbConnKv: await pipe(
      config.dbConnKv,
      async (dbConnKv) =>
        DbConnKv({
          t: 'with-throttled-writes',
          logger,
          dbConnKv,
          throttle: TimeSpan.seconds(10),
          runtime: config.runtime
        }),
      async (dbConnKv) =>
        DbConnKv({
          t: 'with-cache',
          logger,
          source: await dbConnKv,
          cache: await DbConnKv({ t: 'hash-map', map: LRUCache({ maxCapacity: 100_000 }) })
        }),
      async (dbConnKv) =>
        DbConnKv({
          t: 'with-reduced-parsing',
          dbConnKv: await dbConnKv,
          logger,
          verifiedKeys: new Set()
        })
    )
  })
}
