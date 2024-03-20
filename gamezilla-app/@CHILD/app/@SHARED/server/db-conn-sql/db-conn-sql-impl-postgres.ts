import { DbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { err, ok } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/parser"
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

        const output: p.Infer<typeof rowParser>[] = []

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]!
          for (const columnKey in row) {
            const value = row[columnKey]

            if (value instanceof Date) {
              row[columnKey] = value.toUTCString()
            }
          }

          const parsed = rowParser.parse(row)

          if (parsed.t === "err") {
            logger.error(
              `[db] Failed to parse row=${JSON.stringify(
                row,
                null,
                4,
              )} \nerror=${JSON.stringify(parsed.error, null, 4)} sql=${sql}`,
            )
            continue
          }

          output.push(parsed.value)
        }

        return ok(output)
      } catch (error) {
        logger.error(`[db] ${error} sql=${sql}`)
        return err(String(error))
      }
    },
  }
}
