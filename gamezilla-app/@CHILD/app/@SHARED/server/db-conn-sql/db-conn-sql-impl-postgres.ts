import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { err, ok } from "gamezilla-app/@SHARED/core"
import postgres from "postgres"
import { Logger } from "../logger"
import { logQuery } from "./shared"
import { toSql } from "./sql"

export const createDbConnPostgres = async ({
  databaseUrl,
  logger,
}: {
  databaseUrl: string
  logger: Logger
}): Promise<DbConnSql> => {
  const database = postgres(databaseUrl)

  logger.info(`[db-conn-sql-postgres] connected`)

  return {
    query: async (rowParser, rawSql, params) => {
      const sql = toSql(rawSql, params)
      try {
        const start = Date.now()

        const rows = await database.unsafe(sql)

        const end = Date.now()

        logQuery({ logger, sql, start, end })

        const parsed = Array.isArray(rows)
          ? rows.flatMap((row) => {
              const parsed = rowParser.parse(row)
              if (parsed.t === "ok") {
                return [parsed.value]
              }
              logger.error(
                `[db] Failed to parse row=${JSON.stringify(
                  parsed.error,
                  null,
                  4,
                )} sql=${sql}`,
              )
              return []
            })
          : []

        return ok(parsed)
      } catch (error) {
        logger.error(`[db] ${error} sql=${sql}`)
        return err(String(error))
      }
    },
  }
}
