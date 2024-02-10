import { err, ok } from "gamezilla/@SHARED/core"
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server"
import { toSql } from "./sql"
import { Database } from "bun:sqlite"
import { Logger } from "../../../@SHARED/server/logger"
import { logQuery } from "./shared"

export const createDbConnSqlite = async ({
  databaseUrl,
  logger,
}: {
  databaseUrl: string
  logger: Logger
}): Promise<DbConnSql> => {
  const cleaned = databaseUrl.replace("sqlite:", "")

  const database = new Database(cleaned)

  return {
    query: async (isRow, rawSql, params) => {
      try {
        const sql = toSql(rawSql, params)

        const start = Date.now()

        const rows = database.query(sql).all()

        const end = Date.now()

        logQuery({ logger, start, end, sql })

        const parsed = Array.isArray(rows)
          ? rows.flatMap((row) => {
              if (isRow(row)) {
                return [row]
              }
              return []
            })
          : []

        return ok(parsed)
      } catch (error) {
        logger.error(`[db] ${error}`)
        return err(String(error))
      }
    },
  }
}
