import { Posix } from '@/core'
import { Runtime } from '@/runtime'
import { WebServer } from '@/web-server'
import { DATABASE_URL, REDIS_URL } from 'config-private'
import { ClientId, SessionId } from '../data'
import { DbConnKv, type IDbConnKv } from './db-conn-kv'
import { DbConnSql, type IDbConnSql } from './db-conn-sql'
import { Logger } from './logger'
import { ProfileCache } from './profile-cache'
import { IPubSubTopicBased, PubSubTopicBased } from './pub-sub-topic-based'
import type { AppServerCtx } from './server-ctx'
import { ServerInstanceId } from './server-instance/server-instance-id'
import { SMS } from './sms'

export type ITestEnv = {
  t: 'unit' | 'integration' | 'all'
  dbConnKv: IDbConnKv
  pubSubTopicBased: IPubSubTopicBased
  dbConnSql: IDbConnSql
}

export const AppServerTestEnv = async (): Promise<ITestEnv> => {
  if (process.env.IS_INTEGRATION_TEST !== 'true') {
    return {
      t: 'unit',
      dbConnKv: await DbConnKv({ t: 'hash-map' }),
      pubSubTopicBased: await PubSubTopicBased({ t: 'in-memory', map: new Map() }),
      dbConnSql: await DbConnSql({ t: 'noop' })
    }
  }

  const logger = Logger({ t: 'noop' })

  const dbConnSql = await DbConnSql({
    t: 'postgres',
    databaseUrl: DATABASE_URL,
    logger,
    simulateLatency: async () => {}
  })

  const dbConnKv = await DbConnKv({
    t: 'redis',
    logger,
    redisUrl: REDIS_URL,
    simulateLatency: async () => {}
  })

  const pubSubTopicBased = await PubSubTopicBased({ t: 'redis', logger, redisUrl: REDIS_URL })

  return {
    t: 'integration',
    dbConnSql,
    dbConnKv,
    pubSubTopicBased
  }
}

export const randomClient = () => {
  return {
    sessionId: SessionId.generate(),
    clientId: ClientId.generate()
  }
}

export const FixtureAppServer = async () => {
  const logger = Logger({ t: 'noop' })
  const ctx: AppServerCtx = {
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
    server: WebServer({ t: 'bun', logger }),
    serverInstanceId: ServerInstanceId.generate()
  }
  return {
    ctx
    //
  }
}
