import { Posix } from 'gamezilla-app/@/core'
import { ClientId, SessionId } from '../data'
import { DbConnKv, type IDbConnKv } from './db-conn-kv'
import { DbConnSql, type IDbConnSql } from './db-conn-sql'
import { ILogger, Logger } from './logger'
import type { ServerCtx } from './server-ctx'
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

  const logger = ILogger.prefix('integration-test', Logger({ t: 'noop' }))
  const DATABASE_URL = process.env.DATABASE_URL

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not set')
  }

  const dbConnSql = await DbConnSql({
    t: 'pg',
    databaseUrl: DATABASE_URL,
    logger: ILogger.prefix('db-conn-sql', logger)
  })

  const dbConnKv = await DbConnKv({
    t: 'db-conn-sql',
    logger: ILogger.prefix('db-conn-kv', logger),
    dbConnSql
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

export const AppServerFixture = async () => {
  const logger = Logger({ t: 'noop' })
  const ctx: ServerCtx = {
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
