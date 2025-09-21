import { IHttpClient } from '~/@/http-client'
import { ILogger } from '~/@/logger'
import { p } from '~/@/promise'
import { isErr } from '~/@/result'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'

import { s } from '~/@/schema'
import { TimeSpan } from '~/@/time/time-span'
import { Url } from '~/@/url/url'
import { ImplFetch } from './impl-fetch'
import { ImplSqlDb } from './impl-sql-db'
import { IServerRegistry } from './interface'

export type ImplMain = {
  t: 'main'
  httpClient: IHttpClient
  logger: ILogger
  serverRegistrySrcUrl: Url
  sqlDb: ISqlDb
  migrationPolicy: ISqlDbMigrationPolicy
  pollRate?: TimeSpan
  cleanUpRate?: TimeSpan
}

const DEFAULT_POLL_RATE = TimeSpan.seconds(10)
const DEFAULT_CLEAN_UP_RATE = TimeSpan.seconds(10)

const init = (self: ImplMain): IServerRegistry => {
  const logger = self.logger.child(['impl-main'])
  logger.info('Initializing server registry')

  const serverRegistryCache = ImplSqlDb.init({
    t: 'sql-db',
    sqlDb: self.sqlDb,
    logger,
    migrationPolicy: self.migrationPolicy,
  })
  logger.info('Initialized server registry cache')

  const serverRegistrySource = ImplFetch.init({
    t: 'fetch',
    httpClient: self.httpClient,
    logger,
    srcUrl: self.serverRegistrySrcUrl,
  })
  logger.info('Initialized server registry source')

  const workerPollSource = async (signal: AbortSignal) => {
    logger.info('Starting server registry worker')
    while (true) {
      signal.throwIfAborted()
      logger.debug('Fetching server registry from source')
      const got = await serverRegistrySource.get()
      if (isErr(got)) {
        logger.error('Failed to fetch server registry', got.error)
        return
      }
      logger.debug('Updating server registry cache')
      serverRegistryCache.put(got.value)
      logger.debug('Sleeping before next update')
      await p.sleep(self.pollRate ?? DEFAULT_POLL_RATE, signal)
    }
  }

  const workerCacheCleanUp = async (signal: AbortSignal) => {
    logger.info('Starting server registry cache clean up worker')
    while (true) {
      signal.throwIfAborted()
      logger.debug('Cleaning up server registry cache')
      await self.sqlDb.query({
        schema: s.unknown,
        sql: 'DELETE FROM server_registry WHERE id NOT IN (SELECT id FROM server_registry ORDER BY inserted_at_unix_ms DESC LIMIT :limit)',
        vars: {
          limit: 100,
        },
      })
      logger.debug('Sleeping before next clean up')
      await p.sleep(self.cleanUpRate ?? DEFAULT_CLEAN_UP_RATE, signal)
    }
  }

  const worker = async (signal: AbortSignal) => {
    workerPollSource(signal)
    workerCacheCleanUp(signal)
  }

  const abortController = new AbortController()
  const signal = abortController.signal
  worker(signal)
  logger.info('Started server registry worker')

  return {
    async get() {
      logger.debug('Getting server registry from cache')
      return serverRegistryCache.get()
    },
    put(serverRegistry) {
      logger.debug('Putting server registry to cache')
      return serverRegistryCache.put(serverRegistry)
    },
  }
}

export const ImplMain = {
  init,
}
