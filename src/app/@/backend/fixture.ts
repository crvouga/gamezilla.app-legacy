import { DbConnKv, type IDbConnKv } from '~/@/db-conn-kv'
import { type IDbConnSql } from '~/@/db-conn-sql'
import { DbConnSql } from '~/@/db-conn-sql/backend-impl'
import { HttpServer } from '~/@/http-server'
import { Logger } from '~/@/logger'
import { IPubSubTopicBased, PubSubTopicBased } from '~/@/pub-sub-topic-based'
import { Runtime } from '~/@/runtime'
import { SMS } from '~/@/sms'
import { Posix } from '~/@/time/posix'
import { DATABASE_URL, REDIS_URL } from '~/config/backend'
import { IS_INTEGRATION_TEST } from '~/config/shared'
import { ClientId } from '../data/client-id'
import { SessionId } from '../data/session-id'
import { BackendInstanceId } from './backend-instance/backend-instance-id'
import type { AppBackendCtx } from './ctx'
import { ProfileCache } from './profile-cache'

export type ITestEnv = {
  t: 'unit' | 'integration' | 'all'
  dbConnKv: IDbConnKv
  pubSubTopicBased: IPubSubTopicBased
  dbConnSql: IDbConnSql
}

export const AppBackendTestEnv = async (): Promise<ITestEnv> => {
  if (!IS_INTEGRATION_TEST) {
    return {
      t: 'unit',
      dbConnKv: await DbConnKv({ t: 'hash-map' }),
      pubSubTopicBased: await PubSubTopicBased({ t: 'in-memory', map: new Map() }),
      dbConnSql: await DbConnSql({ t: 'noop' }),
    }
  }

  const logger = Logger({ t: 'noop' })

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const dbConnSql = await DbConnSql({
    t: 'postgres',
    databaseUrl: DATABASE_URL,
    logger,
    simulateLatency: async () => {},
  })

  const dbConnKv = await DbConnKv({
    t: 'redis',
    logger,
    redisUrl: REDIS_URL,
    simulateLatency: async () => {},
  })

  const pubSubTopicBased = await PubSubTopicBased({ t: 'redis', logger, redisUrl: REDIS_URL })

  return {
    t: 'integration',
    dbConnSql,
    dbConnKv,
    pubSubTopicBased,
  }
}

export const randomFrontend = () => {
  return {
    sessionId: SessionId.generate(),
    clientId: ClientId.generate(),
  }
}

export const FixtureAppBackend = async () => {
  const logger = Logger({ t: 'noop' })
  const ctx: AppBackendCtx = {
    env: 'test',
    dbConnKv: await DbConnKv({ t: 'hash-map' }),
    dbConnSql: await DbConnSql({ t: 'noop' }),
    logger,
    now: Posix.now(),
    sms: SMS({ t: 'fake', logger }),
    sleep: async () => null,
    pubSub: await PubSubTopicBased({ t: 'noop' }),
    profileCache: await ProfileCache({ t: 'db-conn-kv', dbConnKv: await DbConnKv({ t: 'in-memory' }) }),
    runtime: Runtime({ t: 'noop' }),
    httpServer: HttpServer({ t: 'bun', logger }),
    backendInstanceId: BackendInstanceId.generate(),
  }
  return {
    ctx,
    //
  }
}
