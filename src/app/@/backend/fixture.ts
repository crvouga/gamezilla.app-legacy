import { HttpServerBun } from '~/@/http-server/impl-bun'
import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import type { ILogger } from '~/@/logger'
import { Logger } from '~/@/logger'
import { IPubSubTopicBased, PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { REDIS_URL } from '~/@/redis'
import type { IRuntime } from '~/@/runtime'
import { Runtime } from '~/@/runtime'
import { SMS } from '~/@/sms'
import { type ISqlDb } from '~/@/sql-db'
import { SqlDb } from '~/@/sql-db/backend/impl'
import { SQL_DB_NOOP } from '~/@/sql-db/impl-noop'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
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

  const sqlDbSqlite = await SqlDb({ t: 'bun-sqlite', fileSystem: { t: 'in-memory' }, logger })

  const profileDb = ProfileDb({
    t: 'hash-map',
    logger,
  })

  const now = Posix.now()

  const sleep = async () => {}

  const backendInstanceId = BackendInstanceId.generate()

  const ctx: AppBackendCtxBase = {
    env: 'test',
    keyValueDbDurable: keyValueDbHashMap,
    postgres: SQL_DB_NOOP,
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
      sqlDbSqlite: sqlDbSqlite,
      keyValueDbHashMap,
      pubSubTopicBased,
      runtime,
      logger,
    }
  }

  const sqlDbPostgres = await SqlDb({
    t: 'postgres',
    databaseUrl: CONFIG_BACKEND.DATABASE_URL,
    logger,
    simulateLatency: async () => {},
  })

  const keyValueDbRedis = await KeyValueDb({
    t: 'redis',
    logger,
    redisUrl: REDIS_URL(),
    simulateLatency: async () => {},
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
    t: 'redis',
    logger,
    redisUrl: REDIS_URL(),
  })

  return {
    t: 'integration',
    ctx,
    sqlDbSqlite,
    sqlDbPostgres,
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
