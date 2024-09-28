import { Err, Ok } from 'gamezilla-app/@/core'
import type { p } from 'gamezilla-app/@/core/parser'
import { Sql } from 'gamezilla-app/@/sql'
import pg from 'pg'
import type { ILogger } from '../logger/logger'
import type { IDbConnSql } from './db-conn-sql'
import { logQuery } from './shared'

declare global {
  var pgPool: pg.Pool
  var pgPoolClient: pg.PoolClient
}

const connect = async (databaseUrl: string) => {
  globalThis.pgPool ??= new pg.Pool({
    connectionString: databaseUrl
  })
  globalThis.pgPoolClient ??= await globalThis.pgPool.connect()
}

export const DbConnPostgres = async ({
  databaseUrl,
  logger
}: {
  databaseUrl: string
  logger: ILogger
}): Promise<IDbConnSql> => {
  await connect(databaseUrl)

  return {
    async query(rowParser, rawSql, params) {
      const sql = Sql.to(rawSql, params)
      try {
        const start = Date.now()

        let queried: pg.QueryResult<any>
        try {
          queried = await pgPool.query(sql)
        } catch (error) {
          logger.error(`Errored while querying\nerror=${error}\nsql=${rawSql}`)
          logger.info('Reconnecting to database to retry query')
          await connect(databaseUrl)
          queried = await pgPool.query(sql)
        }

        const end = Date.now()

        logQuery({
          logger,
          sql: Sql.toLog(rawSql, params),
          start,
          end
        })

        const output: p.Infer<typeof rowParser>[] = []

        for (let i = 0; i < queried.rows.length; i++) {
          const row = queried.rows[i]!
          for (const columnKey in row) {
            const value = row[columnKey]

            if (value instanceof Date) {
              row[columnKey] = value.toUTCString()
            }
          }

          const parsed = rowParser.parse(row)

          switch (parsed.t) {
            case 'err': {
              const rowStr = JSON.stringify(row, null, 4)
              const errorStr = JSON.stringify(parsed.error, null, 4)
              const error = `Failed to parse row\nerror=${errorStr}\nrow=${rowStr}\nsql=${rawSql}`
              return Err(error)
            }

            case 'ok': {
              output.push(parsed.value)
              break
            }
          }
        }

        return Ok(output)
      } catch (error) {
        console.error(sql, error)
        logger.error(`${error} sql=${rawSql}`)
        return Err(String(error))
      }
    },

    async onNotification(callback) {
      const cb = (notification: pg.Notification) => {
        callback({
          processId: notification.processId,
          channel: notification.channel,
          payload: notification.payload
        })
      }

      pgPoolClient.on('notification', cb)

      return () => {
        pgPoolClient.off('notification', cb)
      }
    }
  }
}
