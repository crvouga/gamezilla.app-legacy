import { NonEmpty } from '~/@/array/non-empty'
import { DbConnKv } from '~/@/db-conn-kv'
import { DbConnSql } from '~/@/db-conn-sql'
import { ILogger, Logger } from '~/@/logger'
import { unwrapOr } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import { IBackendInstanceDb, BackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'
import { DATABASE_URL } from '~/config/backend'

export type Ctx = {
  logger: ILogger
  backendInstanceDb: IBackendInstanceDb
}

export const initCtx = async (config: { logger: ILogger }): Promise<Ctx> => {
  const logger = Logger.prefix('load-balancer', config.logger)
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const dbConnSql = await DbConnSql({
    t: 'postgres',
    databaseUrl: DATABASE_URL,
    logger,
  })
  const dbConnKv = await DbConnKv({
    t: 'postgres',
    logger,
    dbConnSql,
  })
  const backendInstanceDb = BackendInstanceDb({
    t: 'db-conn-kv',
    dbConnKv,
  })
  return {
    logger,
    backendInstanceDb,
  }
}

const MINIMAL_HEART_RATE = TimeSpan.minutes(1.5)

export const respond = async (ctx: Ctx, request: Request): Promise<Response> => {
  ctx.logger.info(`${request.method} ${request.url}`)

  const alive = unwrapOr(await ctx.backendInstanceDb.listAlive({ minimalHeartRate: MINIMAL_HEART_RATE }), [])

  if (!NonEmpty.is(alive)) {
    return new Response('No backends available', {
      status: 503,
    })
  }

  const response = new Response(JSON.stringify(alive), {
    headers: {
      'content-type': 'application/json',
      redirect: 'https://www.google.com',
    },
    status: 200,
  })

  return response
}
