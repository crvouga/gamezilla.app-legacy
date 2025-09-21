import { IHttpClient } from '~/@/http-client'
import { ILogger } from '~/@/logger'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'
import { Url } from '~/@/url/url'
import { ImplFetch } from './impl-fetch'
import { ImplSqlDb } from './impl-sql-db'
import { IServerRegistry } from './interface'
import { isErr, Ok } from '~/@/result'

export type ImplMain = {
  t: 'main'
  httpClient: IHttpClient
  logger: ILogger
  srcUrl: Url
  sqlDb: ISqlDb
  migrationPolicy: ISqlDbMigrationPolicy
}

const init = (self: ImplMain): IServerRegistry => {
  const logger = self.logger.child(['impl-main'])

  const implSqlDb = ImplSqlDb.init({
    t: 'sql-db',
    sqlDb: self.sqlDb,
    logger,
    migrationPolicy: self.migrationPolicy,
  })

  const implFetch = ImplFetch.init({
    t: 'fetch',
    httpClient: self.httpClient,
    logger,
    srcUrl: self.srcUrl,
  })

  return {
    async get() {
      const cached = await implSqlDb.get()
      if (isErr(cached)) return cached
      if (cached.value) return Ok(cached.value)
      const fresh = await implFetch.get()
      if (isErr(fresh)) return fresh
      implSqlDb.put(fresh.value)
      return Ok(fresh.value)
    },
    put(serverRegistry) {
      return implSqlDb.put(serverRegistry)
    },
  }
}

export const ImplMain = {
  init,
}
