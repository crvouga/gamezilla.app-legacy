import { Err, Ok } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"
import pg from "pg"
import { Logger } from "../logger"
import { IDbConnSql } from "./db-conn-sql"
import { logQuery } from "./shared"
import { toSql, toSqlLog } from "./sql"

let pool: pg.Pool

export const createDbConnPostgres = async ({
  databaseUrl,
  logger,
}: {
  databaseUrl: string
  logger: Logger
}): Promise<IDbConnSql> => {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: databaseUrl,
    })
  }

  let client: pg.Client

  return {
    async query(rowParser, rawSql, params) {
      const sql = toSql(rawSql, params)
      try {
        const start = Date.now()

        const queried = await pool.query(sql)

        const end = Date.now()

        logQuery({
          logger,
          sql: toSqlLog(rawSql, params),
          start,
          end,
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

          if (parsed.t === "err") {
            if (process.env.NODE_ENV === "test") {
              throw new Error(
                `Failed to parse \nerror=${JSON.stringify(
                  parsed.error,
                  null,
                  4,
                )} sql=${rawSql}`,
              )
            }
            logger.error(
              `[db] Failed to parse row=${JSON.stringify(
                row,
                null,
                4,
              )} \nerror=${JSON.stringify(
                parsed.error,
                null,
                4,
              )} sql=${rawSql}`,
            )
            continue
          }

          output.push(parsed.value)
        }

        return Ok(output)
      } catch (error) {
        logger.error(`[db] ${error} sql=${rawSql}`)
        return Err(String(error))
      }
    },

    async onNotification(callback) {
      const cb = (notification: pg.Notification) => {
        callback({
          processId: notification.processId,
          channel: notification.channel,
          payload: notification.payload,
        })
      }

      client = client ?? (await pool.connect())

      client.on("notification", cb)

      return () => {
        client.off("notification", cb)
      }
    },
  }
}
