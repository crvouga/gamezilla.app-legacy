import { FileSystem } from '~/@/file-system'
import { HttpServer } from '~/@/http-server'
import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger'
import { Logger } from '~/@/logger'
import { MigrationPolicy } from '~/@/migration-policy'
import { IPubSubTopicBased, PubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { IRuntime } from '~/@/runtime'
import { Runtime } from '~/@/runtime'
import { type ISqlDb } from '~/@/sql-db'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { SQL_DB_NOOP } from '~/@/sql-db/impl-noop'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { ProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { ClientId } from '../../../@/wire/client-id'
import { SessionId } from '../../../@/wire/session-id'
import { BackendInstanceId } from './backend-instance/backend-instance-id'
import type { AppBackendCtxBase } from './ctx'

export type IFixtureAppBackendUnit = {
  t: 'unit'
  ctx: AppBackendCtxBase
  runtime: IRuntime
  logger: ILogger
  pubSubTopicBased: IPubSubTopicBased
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

  const pubSub = await PubSubTopicBased({ t: 'in-memory', subscribersByTopic: new Map() })

  const runtime = Runtime({ t: 'process', logger, shutoffFGracePeriod: TimeSpan.seconds(0) })

  const httpServer = HttpServer({ t: 'node', logger })

  const keyValueDbHashMap = await KeyValueDb({ t: 'hash-map' })

  const fs = FileSystem({ t: 'node' })

  const sqlDbSqlite = await SqlDb({
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

  const sleep = async () => {}

  const backendInstanceId = BackendInstanceId.generate()

  const migrationPolicy = MigrationPolicy({ t: 'always-run', logger: Logger({ t: 'noop' }) })

  const ctx: AppBackendCtxBase = {
    backendRole: 'primary',
    env: 'test',
    keyValueDbDurable: keyValueDbHashMap,
    sqlDb: SQL_DB_NOOP,
    migrationPolicy,
    logger,
    now,
    sleep,
    pubSub,
    userProfileDb: profileDb,
    runtime,
    httpServer,
    backendInstanceId,
  }

  if (!CONFIG_SHARED.IS_INTEGRATION_TEST) {
    const pubSubTopicBased = await PubSubTopicBased({ t: 'in-memory', subscribersByTopic: new Map() })

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

  const sqlDbPostgres = await SqlDb({
    t: 'postgres',
    databaseUrl: CONFIG_BACKEND.DATABASE_URL(),
    logger,
  })

  const keyValueDbPostgres = await KeyValueDb({
    t: 'sql-db',
    sqlDb: sqlDbPostgres,
    logger,
  })

  const keyValueDbSqlite = await KeyValueDb({
    t: 'sql-db',
    sqlDb: sqlDbSqlite,
    logger,
  })

  const pubSubTopicBased = await PubSubTopicBased({
    t: 'postgres',
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
