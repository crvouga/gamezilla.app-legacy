import { type IDbConnSql } from '~/@/db-conn-sql'
import { DbConnSql } from '~/@/db-conn-sql/backend/impl'
import { dbConnSqlNoop } from '~/@/db-conn-sql/impl'
import { HttpServerBun } from '~/@/http-server/impl-bun'
import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger'
import { Logger } from '~/@/logger'
import { IPubSubTopicBased, PubSubTopicBased } from '~/@/pub-sub-topic-based'
import type { IRuntime } from '~/@/runtime'
import { Runtime } from '~/@/runtime'
import { SMS } from '~/@/sms'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { ProfileDb } from '~/app/profile/@/user-profile/user-profile-db'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { ClientId } from '../../../@/wire/client-id'
import { SessionId } from '../../../@/wire/session-id'
import { BackendInstanceId } from './backend-instance/backend-instance-id'
import type { AppBackendCtx } from './ctx'
// import { newPowerSyncClient } from '~/service-powersync/frontend/database'

export type IFixtureAppBackendUnit = {
  t: 'unit'
  ctx: AppBackendCtx
  runtime: IRuntime
  logger: ILogger
  pubSubTopicBased: IPubSubTopicBased
  dbConnSqlite: IDbConnSql
  keyValueDbHashMap: IKeyValueDb
}

export type IFixtureAppBackendIntegration = Omit<IFixtureAppBackendUnit, 't'> & {
  t: 'integration'
  dbConnPostgres: IDbConnSql
  // dbConnPowersyncClient: IDbConnSql
  keyValueDbRedis: IKeyValueDb
  keyValueDbPostgres: IKeyValueDb
  keyValueDbSqlite: IKeyValueDb
}

export type IFixtureAppBackend = IFixtureAppBackendUnit | IFixtureAppBackendIntegration

export const FixtureAppBackend = async (): Promise<IFixtureAppBackend> => {
  const logger = Logger({ t: 'noop' })

  const sms = SMS({ t: 'fake', logger })

  const pubSub = await PubSubTopicBased({ t: 'in-memory', subscribersByTopic: new Map() })

  const runtime = Runtime({ t: 'process', logger, shutoffFGracePeriod: TimeSpan.seconds(0) })

  const httpServer = HttpServerBun({ t: 'bun', logger })

  const keyValueDbHashMap = await KeyValueDb({ t: 'hash-map' })

  const dbConnSqlite = await DbConnSql({ t: 'bun-sqlite', fileSystem: { t: 'in-memory' }, logger })

  const profileDb = ProfileDb({
    t: 'hash-map',
    logger,
  })

  const now = Posix.now()

  const sleep = async () => {}

  const backendInstanceId = BackendInstanceId.generate()

  const ctx: AppBackendCtx = {
    env: 'test',
    keyValueDb: keyValueDbHashMap,
    dbConnSql: dbConnSqlNoop,
    logger,
    now,
    sms,
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
      dbConnSqlite,
      keyValueDbHashMap,
      pubSubTopicBased,
      runtime,
      logger,
    }
  }

  const dbConnPostgres = await DbConnSql({
    t: 'postgres',
    databaseUrl: CONFIG_BACKEND.DATABASE_URL,
    logger,
    simulateLatency: async () => {},
  })

  // const dbConnPowersyncClient = await DbConnSql({
  //   t: 'powersync-client',
  //   powerSyncClient: await newPowerSyncClient({ test: true }),
  //   logger,
  // })

  const keyValueDbRedis = await KeyValueDb({
    t: 'redis',
    logger,
    redisUrl: CONFIG_BACKEND.REDIS_URL,
    simulateLatency: async () => {},
  })

  const keyValueDbPostgres = await KeyValueDb({
    t: 'db-conn-sql',
    dbConnSql: dbConnPostgres,
    logger,
  })

  const keyValueDbSqlite = await KeyValueDb({
    t: 'db-conn-sql',
    dbConnSql: dbConnSqlite,
    logger,
  })

  const pubSubTopicBased = await PubSubTopicBased({
    t: 'redis',
    logger,
    redisUrl: CONFIG_BACKEND.REDIS_URL,
  })

  return {
    t: 'integration',
    ctx,
    dbConnSqlite,
    dbConnPostgres,
    // dbConnPowersyncClient,
    keyValueDbSqlite,
    keyValueDbHashMap,
    keyValueDbRedis,
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
