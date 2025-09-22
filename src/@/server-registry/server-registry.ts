import { IHttpClient } from '~/@/http-client'
import { ILogger } from '~/@/logger'
import { p } from '~/@/promise'
import { isErr } from '~/@/result'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'

import { TimeSpan } from '~/@/time/time-span'
import { Url } from '~/@/url/url'

import { ServerRegistryRecordDb } from './server-registry-record-db/impl'

export type ServerRegistry = {
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

const init = (self: ServerRegistry) => {
  const logger = self.logger.child(['impl-main'])

  const serverRegistryCache = ServerRegistryRecordDb.init({
    t: 'sql-db',
    sqlDb: self.sqlDb,
    logger,
    migrationPolicy: self.migrationPolicy,
  })

  const serverRegistrySource = ServerRegistryRecordDb.init({
    t: 'src-url',
    srcUrl: self.serverRegistrySrcUrl,
    httpClient: self.httpClient,
    logger,
  })

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
      serverRegistryCache.insert(got.value)
      logger.debug('Sleeping before next update')
      await p.sleep(self.pollRate ?? DEFAULT_POLL_RATE, signal)
    }
  }

  const workerCacheCleanUp = async (signal: AbortSignal) => {
    logger.info('Starting server registry cache clean up worker')
    while (true) {
      signal.throwIfAborted()
      logger.debug('Cleaning up server registry cache')
      await serverRegistryCache.cleanUp()
      logger.debug('Sleeping before next clean up')
      await p.sleep(self.cleanUpRate ?? DEFAULT_CLEAN_UP_RATE, signal)
    }
  }

  const worker = async (signal: AbortSignal) => {
    workerPollSource(signal)
    workerCacheCleanUp(signal)
  }

  return {
    async get() {
      logger.debug('Getting server registry from cache')
      return serverRegistryCache.get()
    },
    async worker(abortSignal: AbortSignal) {
      worker(abortSignal)
      logger.info('Started server registry worker')
    },
  }
}

export const ServerRegistry = {
  init,
}
