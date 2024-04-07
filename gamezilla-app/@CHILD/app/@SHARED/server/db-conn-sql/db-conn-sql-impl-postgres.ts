import { Err, Ok } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"
import postgres from "postgres"
import { Logger } from "../logger"
import { IDbConnSql } from "./db-conn-sql"
import { logQuery } from "./shared"
import { toSql } from "./sql"

export const createDbConnPostgres = async ({
  databaseUrl,
  logger,
}: {
  databaseUrl: string
  logger: Logger
}): Promise<IDbConnSql> => {
  const database = await getDatabaseConnection({
    logger,
    databaseUrl,
  })

  if (!database) {
    logger.error(`[db-conn-sql-postgres] failed to connect`)
    throw new Error("Failed to connect to the database")
  }

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

        return Ok(output)
      } catch (error) {
        logger.error(`[db] ${error} sql=${sql}`)
        return Err(String(error))
      }
    },
  }
}

const MAX_RETRIES = 5
const RETRY_DELAY = 2000

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getDatabaseConnection = async ({
  logger,
  databaseUrl,
}: {
  databaseUrl: string
  logger: Logger
}) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const database = postgres(databaseUrl)
      await database.unsafe("SELECT 1")
      logger.info(`[db-conn-sql-postgres] connected`)
      return database
    } catch (error) {
      logger.error(
        `Attempt ${attempt}: Failed to connect to the database. Error: ${error}`,
      )
      await delay(RETRY_DELAY)
    }
  }
  return null
}
