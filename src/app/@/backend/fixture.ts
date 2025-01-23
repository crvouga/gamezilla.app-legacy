import { KeyValueDb, type IKeyValueDb } from '~/@/key-value-db'
import { type IDbConnSql } from '~/@/db-conn-sql'
import { DbConnSql } from '~/@/db-conn-sql/backend/impl'
import { dbConnSqlNoop } from '~/@/db-conn-sql/impl'
import { HttpServer } from '~/@/http-server'
import { Logger } from '~/@/logger'
import { IPubSubTopicBased, PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { Runtime } from '~/@/runtime'
import { SMS } from '~/@/sms'
import { Posix } from '~/@/time/posix'
import { CONFIG_BACKEND } from '~/config/backend'
import { CONFIG_SHARED } from '~/config/shared'
import { ClientId } from '../data/client-id'
import { SessionId } from '../data/session-id'
import { BackendInstanceId } from './backend-instance/backend-instance-id'
import type { AppBackendCtx } from './ctx'
import { ProfileCache } from './profile-cache'

export type IFixtureAppBackend = {
  t: 'unit' | 'integration'
  ctx: AppBackendCtx
  keyValueDb: IKeyValueDb
  pubSubTopicBased: IPubSubTopicBased
  dbConnPostgres: IDbConnSql
  dbConnSqlite: IDbConnSql
}

export const FixtureAppBackend = async (): Promise<IFixtureAppBackend> => {
  const logger = Logger({ t: 'noop' })

  const sms = SMS({ t: 'fake', logger })

  const pubSub = await PubSubTopicBased({ t: 'in-memory', subscribersByTopic: new Map() })

  const profileCache = await ProfileCache({ t: 'key-value-db', keyValueDb: await KeyValueDb({ t: 'in-memory' }) })

  const ctx: AppBackendCtx = {
    env: 'test',
    keyValueDb: await KeyValueDb({ t: 'hash-map' }),
    dbConnSql: dbConnSqlNoop,
    logger,
    now: Posix.now(),
    sms,
    sleep: async () => null,
    pubSub,
    profileCache,
    runtime: Runtime({ t: 'noop' }),
    httpServer: HttpServer({ t: 'bun', logger }),
    backendInstanceId: BackendInstanceId.generate(),
  }

  const dbConnSqlite = await DbConnSql({
    t: 'bun-sqlite',
    fileSystem: {
      t: 'in-memory',
    },
    logger,
  })

  if (!CONFIG_SHARED.IS_INTEGRATION_TEST) {
    return {
      t: 'unit',
      ctx,
      dbConnSqlite,
      keyValueDb: await KeyValueDb({ t: 'hash-map' }),
      pubSubTopicBased: await PubSubTopicBased({ t: 'in-memory', subscribersByTopic: new Map() }),
      dbConnPostgres: dbConnSqlNoop,
    }
  }

  const dbConnPostgres = await DbConnSql({
    t: 'postgres',
    databaseUrl: CONFIG_BACKEND.DATABASE_URL,
    logger,
    simulateLatency: async () => {},
  })

  const keyValueDb = await KeyValueDb({
    t: 'redis',
    logger,
    redisUrl: CONFIG_BACKEND.REDIS_URL,
    simulateLatency: async () => {},
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
    keyValueDb,
    pubSubTopicBased,
  }
}

export const randomFrontend = () => {
  return {
    sessionId: SessionId.generate(),
    clientId: ClientId.generate(),
  }
}
