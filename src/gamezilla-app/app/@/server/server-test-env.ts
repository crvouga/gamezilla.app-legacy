import { Posix } from 'gamezilla-app/@/core'
import { DATABASE_URL, REDIS_URL } from 'gamezilla-app/config-private'
import { ClientId, SessionId } from '../data'
import { DbConnKv, type IDbConnKv } from './db-conn-kv'
import { DbConnSql, type IDbConnSql } from './db-conn-sql'
import { Logger } from './logger'
import type { AppServerCtx } from './server-ctx'
import { SMS } from './sms'

export type ITestEnv =
  | {
      t: 'unit'
      dbConnKv: IDbConnKv
    }
  | {
      t: 'integration'
      dbConnSql: IDbConnSql
      dbConnKv: IDbConnKv
    }
  | {
      t: 'all'
      dbConnSql: IDbConnSql
      dbConnKv: IDbConnKv
    }

export const AppServerTestEnv = async (): Promise<ITestEnv> => {
  if (process.env.IS_INTEGRATION_TEST !== 'true') {
    return {
      t: 'unit',
      dbConnKv: await DbConnKv({
        t: 'hash-map'
      })
    }
  }

  const logger = Logger.prefix('integration-test', Logger({ t: 'noop' }))

  const dbConnSql = await DbConnSql({
    t: 'postgres',
    databaseUrl: DATABASE_URL,
    logger: Logger.prefix('db-conn-sql', logger),
    simulateLatency: async () => {}
  })

  const dbConnKv = await DbConnKv({
    t: 'redis',
    logger: Logger.prefix('db-conn-kv', logger),
    redisUrl: REDIS_URL
  })

  return {
    t: 'integration',
    dbConnSql,
    dbConnKv
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
    sleep: async () => null
  }
  return {
    ctx
    //
  }
}
