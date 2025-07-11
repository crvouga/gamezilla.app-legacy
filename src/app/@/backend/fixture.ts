import { FileSystem } from '~/@/file-system'
import { HttpServer } from '~/@/http-server'
import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger'
import { Logger } from '~/@/logger'
import { ITopicBasedPubSub, TopicBasedPubSub } from '~/@/pub-sub-topic-based'
import type { IRuntime } from '~/@/runtime'
import { Runtime } from '~/@/runtime'
import { type ISqlDb } from '~/@/sql-db'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { SQL_DB_NOOP } from '~/@/sql-db/impl-noop'
import { SyncEngineServer } from '~/@/sync-engine/sync-engine-server'
import { randomServerPort } from '~/@/test/random-server-port'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { ProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { ClientId } from '../../../@/wire/client-id'
import { SessionId } from '../../../@/wire/session-id'
import type { AppBackendCtxBase } from './ctx'

export type IFixtureAppBackendUnit = {
  t: 'unit'
  ctx: AppBackendCtxBase
  runtime: IRuntime
  logger: ILogger
  pubSubTopicBased: ITopicBasedPubSub
  sqlDbSqlite: ISqlDb
  keyValueDbHashMap: IKeyValueDb
}

export type IFixtureAppBackendIntegration = Omit<IFixtureAppBackendUnit, 't'> & {
  t: 'integration'
  sqlDbPostgres: ISqlDb
  keyValueDbPostgres: IKeyValueDb
  keyValueDbSqlite: IKeyValueDb
}

export type IFixtureAppBackend = IFixtureAppBackendUnit | IFixtureAppBackendIntegration

export const FixtureAppBackend = async (): Promise<IFixtureAppBackend> => {
  const logger = Logger({ t: 'noop' })

  const pubSub = TopicBasedPubSub({ t: 'in-memory', subscribersByTopic: new Map() })

  const runtime = Runtime({ t: 'process', logger, shutoffFGracePeriod: TimeSpan.seconds(0) })

  const httpServer = HttpServer({ t: 'node', logger })

  const keyValueDbHashMap = KeyValueDb({ t: 'hash-map' })

  const fs = FileSystem({ t: 'node' })

  const sqlDbSqlite = SqlDb({
    t: 'better-sqlite3',
    databasePath: ':memory:',
    logger,
    fs,
  })

  const profileDb = ProfileDb({
    t: 'hash-map',
    logger,
  })

  const now = UnixMs.now()

  const migrationPolicy = SqlDbMigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) })

  const syncEngine = SyncEngineServer({ logger })

  const ctx: AppBackendCtxBase = {
    fileSystem: FileSystem({ t: 'node' }),
    port: randomServerPort(),
    syncEngine,
    env: 'test',
    keyValueDbDurable: keyValueDbHashMap,
    sqlDb: SQL_DB_NOOP,
    migrationPolicy,
    logger,
    now,
    pubSub,
    userProfileDb: profileDb,
    runtime,
    httpServer,
  }

  if (!CONFIG_SHARED.IS_INTEGRATION_TEST) {
    const pubSubTopicBased = TopicBasedPubSub({ t: 'in-memory', subscribersByTopic: new Map() })

    return {
      t: 'unit',
      ctx,
      sqlDbSqlite: sqlDbSqlite,
      keyValueDbHashMap,
      pubSubTopicBased,
      runtime,
      logger,
    }
  }

  const sqlDbPostgres = SqlDb({
    t: 'postgres',
    databaseUrl: CONFIG_BACKEND.DATABASE_URL(),
    logger,
  })

  const keyValueDbPostgres = KeyValueDb({
    t: 'sql-db',
    sqlDb: sqlDbPostgres,
    logger,
  })

  const keyValueDbSqlite = KeyValueDb({
    t: 'sql-db',
    sqlDb: sqlDbSqlite,
    logger,
  })

  const pubSubTopicBased = TopicBasedPubSub({
    t: 'sql-db',
    logger,
    sqlDb: sqlDbPostgres,
  })

  return {
    t: 'integration',
    ctx,
    sqlDbSqlite,
    sqlDbPostgres,
    keyValueDbSqlite,
    keyValueDbHashMap,
    keyValueDbPostgres,
    pubSubTopicBased,
    runtime,
    logger,
  }
}

export const randomFrontend = () => {
  return {
    sessionId: SessionId.generate(),
    clientId: ClientId.generate(),
  }
}
