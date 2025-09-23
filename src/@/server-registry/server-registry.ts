import { IHttpClient } from '~/@/http-client'
import { ILogger } from '~/@/logger'
import { p } from '~/@/promise'
import { isErr, unwrap } from '~/@/result'
import { ISqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/interface'
import { ISqlDb } from '~/@/sql-db/interface'

import { TimeSpan } from '~/@/time/time-span'
import { Url } from '~/@/url/url'

import { NonEmpty } from '../array/non-empty'
import { ServerRegistryRecordDb } from './server-registry-record-db/impl'
import { ServerRegistryId } from './server-registry-record-id'

export type ServerRegistry = {
  httpClient: IHttpClient
  logger: ILogger
  serverRegistrySrcUrl: Url
  sqlDb: ISqlDb
  migrationPolicy: ISqlDbMigrationPolicy
  pollRate?: TimeSpan
}

const DEFAULT_POLL_RATE = TimeSpan.seconds(30)

const init = (self: ServerRegistry) => {
  const logger = self.logger.child(['impl-main'])

  const serverRegistrySource = ServerRegistryRecordDb.init({
    t: 'src-url',
    srcUrl: self.serverRegistrySrcUrl,
    httpClient: self.httpClient,
    logger,
  })

  const serverRegistryCache = ServerRegistryRecordDb.init({
    t: 'sql-db',
    sqlDb: self.sqlDb,
    logger,
    migrationPolicy: self.migrationPolicy,
  })

  const workerPoll = async (signal: AbortSignal) => {
    logger.info('Starting server registry worker')
    while (true) {
      signal.throwIfAborted()
      logger.debug('Fetching server registry from source')
      const got = await serverRegistrySource.get()
      if (isErr(got)) {
        logger.error('Failed to fetch server registry', got.error)
        await p.sleep(self.pollRate ?? DEFAULT_POLL_RATE, signal)
        continue
      }
      logger.debug('Updating server registry cache')
      const id = ServerRegistryId.generate()
      logger.debug(`Inserting server registry into cache: ${id}`)
      await serverRegistryCache.insert(id, got.value)
      logger.debug(`Cleaning up server registry cache: ${id}`)
      await serverRegistryCache.cleanUp()
      await p.sleep(self.pollRate ?? DEFAULT_POLL_RATE, signal)
    }
  }

  const worker = async (signal: AbortSignal) => {
    workerPoll(signal)
  }

  return {
    async getServerUrls(): Promise<NonEmpty<Url>> {
      const got = unwrap(await serverRegistryCache.get())
      const serverUrls = got.servers.map((s) => s.url)
      return NonEmpty.assert(serverUrls)
    },
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
