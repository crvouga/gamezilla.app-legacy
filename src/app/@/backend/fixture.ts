import { FileSystem } from '~/@/file-system'
import { HttpServer } from '~/@/http-server'
import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger'
import { Logger } from '~/@/logger'
import { HttpClient } from '~/@/http-client/impl'
import { ITopicBasedPubSub, TopicBasedPubSub } from '~/@/pub-sub-topic-based'
import type { IRuntime } from '~/@/runtime'
import { Runtime } from '~/@/runtime'
import { SecretString } from '~/@/secrets/secret-string'
import { ServerRegistry } from '~/@/server-registry/server-registry'
import { SqlDbMigrationPolicy } from '~/@/sql-db-migration-policy/impl'
import { BackendSqlDb } from '~/@/sql-db/backend-impl'
import type { ISqlDb } from '~/@/sql-db/interface'
import { SyncEngineServer } from '~/@/sync-engine/sync-engine-server'
import { IS_INTEGRATION_TEST } from '~/@/test/is-integration-test'
import { randomServerPort } from '~/@/test/random-server-port'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Url } from '~/@/url/url'
import { ClientId } from '~/@/wire/client-id'
import { SessionId } from '~/@/wire/session-id'
import { ProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
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
  const logger = Logger.init({ t: 'noop' })

  const pubSub = TopicBasedPubSub.init({ t: 'in-memory', subscribersByTopic: new Map() })

  const runtime = Runtime({ t: 'process', logger, shutoffFGracePeriod: TimeSpan.seconds(0) })

  const httpServer = HttpServer.init({ t: 'node', logger })

  const keyValueDbHashMap = KeyValueDb.init({ t: 'hash-map' })

  const fs = FileSystem.init({ t: 'node' })

  const sqlDbSqlite = BackendSqlDb.init({
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

  // For unit tests with SQLite, use always-run to ensure migrations execute
  // SQLite is migratable, so this is safe
  const migrationPolicy = SqlDbMigrationPolicy.init({ t: 'always-run', logger })

  const serverRegistry = ServerRegistry.init({
    httpClient: HttpClient.init({ t: 'fetch' }),
    logger,
    migrationPolicy,
    serverRegistrySrcUrl: Url.derive('', 'http'),
    sqlDb: sqlDbSqlite,
  })

  const syncEngine = SyncEngineServer({ logger })

  const ctx: AppBackendCtxBase = {
    fileSystem: FileSystem.init({ t: 'node' }),
    port: randomServerPort(),
    syncEngine,
    env: 'test',
    keyValueDbDurable: keyValueDbHashMap,
    sqlDb: sqlDbSqlite,
    migrationPolicy,
    logger,
    now,
    pubSub,
    userProfileDb: profileDb,
    runtime,
    httpServer,
    serverRegistry,
  }

  if (!IS_INTEGRATION_TEST) {
    const pubSubTopicBased = TopicBasedPubSub.init({ t: 'in-memory', subscribersByTopic: new Map() })

    return {
      t: 'unit',
      ctx: { ...ctx, sqlDb: sqlDbSqlite },
      sqlDbSqlite: sqlDbSqlite,
      keyValueDbHashMap,
      pubSubTopicBased,
      runtime,
      logger,
    }
  }

  const DATABASE_URL = SecretString.init('DATABASE_URL', process.env.DATABASE_URL)
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

  const sqlDbPostgres = BackendSqlDb.init({
    t: 'postgres',
    databaseUrl: DATABASE_URL,
    logger,
  })

  const keyValueDbPostgres = KeyValueDb.init({
    t: 'sql-db',
    sqlDb: sqlDbPostgres,
    logger,
    migrationPolicy: SqlDbMigrationPolicy.init({ t: 'never-run', logger }),
  })

  const keyValueDbSqlite = KeyValueDb.init({
    t: 'sql-db',
    sqlDb: sqlDbSqlite,
    migrationPolicy: SqlDbMigrationPolicy.init({ t: 'never-run', logger }),
    logger,
  })

  const pubSubTopicBased = TopicBasedPubSub.init({
    t: 'sql-db',
    logger,
    sqlDb: sqlDbPostgres,
  })

  return {
    t: 'integration',
    ctx: { ...ctx, sqlDb: sqlDbPostgres },
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
