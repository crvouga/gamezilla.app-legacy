import { DbConnKv } from 'gamezilla-app/app/@/server/db-conn-kv'
import { DbConnSql } from 'gamezilla-app/app/@/server/db-conn-sql'
import { ILogger, Logger } from 'gamezilla-app/app/@/server/logger'
import { IServerInstanceDb, ServerInstanceDb } from 'gamezilla-app/app/@/server/server-instance/server-instance-db'
import { DATABASE_URL } from 'gamezilla-app/config-private'

export type Ctx = {
  logger: ILogger
  serverInstanceDb: IServerInstanceDb
}

export const initCtx = async (): Promise<Ctx> => {
  const logger = Logger({ t: 'console' })
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

export const respond = async (ctx: Ctx, request: Request): Promise<Response> => {
  ctx.logger.info(`${request.method} ${request.url}`)

  const response = new Response('Hello', {
    headers: {
      'content-type': 'text/plain',
      redirect: 'https://www.google.com'
    },
    status: 200
  })

  return response
}
