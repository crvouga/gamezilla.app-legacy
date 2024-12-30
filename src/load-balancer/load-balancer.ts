import { NonEmpty } from '~/@/array/non-empty'
import { unwrapOr } from '~/@/core'
import { DbConnKv } from '~/@/db-conn-kv'
import { DbConnSql } from '~/@/db-conn-sql'
import { ILogger, Logger } from '~/@/logger'
import { TimeSpan } from '~/@/time/time-span'
import { IServerInstanceDb, ServerInstanceDb } from '~/app/@/server/server-instance/server-instance-db'
import { DATABASE_URL } from '~/config-private'

export type Ctx = {
  logger: ILogger
  serverInstanceDb: IServerInstanceDb
}

export const initCtx = async (config: { logger: ILogger }): Promise<Ctx> => {
  const logger = Logger.prefix('load-balancer', config.logger)
  const dbConnSql = await DbConnSql({
    t: 'postgres',
    databaseUrl: DATABASE_URL,
    logger
  })
  const dbConnKv = await DbConnKv({
    t: 'postgres',
    logger,
    dbConnSql
  })
  const serverInstanceDb = ServerInstanceDb({
    t: 'db-conn-kv',
    dbConnKv
  })
  return {
    logger,
    serverInstanceDb
  }
}

const MINIMAL_HEART_RATE = TimeSpan.minutes(1.5)

export const respond = async (ctx: Ctx, request: Request): Promise<Response> => {
  ctx.logger.info(`${request.method} ${request.url}`)

  const alive = unwrapOr(await ctx.serverInstanceDb.listAlive({ minimalHeartRate: MINIMAL_HEART_RATE }), [])

  if (!NonEmpty.is(alive)) {
    return new Response('No servers available', {
      status: 503
    })
  }

  const response = new Response(JSON.stringify(alive), {
    headers: {
      'content-type': 'application/json',
      redirect: 'https://www.google.com'
    },
    status: 200
  })

  return response
}
