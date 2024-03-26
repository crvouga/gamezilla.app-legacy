import { Ok } from "gamezilla-app/@SHARED/core"
import { Logger } from "../logger"
import { DbConnSql } from "./db-conn-sql"
import { createDbConnPostgres } from "./db-conn-sql-impl-postgres"

export const dbConnSqlNoop: DbConnSql = {
  query: async () => {
    return Ok([])
  },
}

export const createDbConnSql = async ({
  databaseUrl,
  logger,
}: {
  databaseUrl: string
  logger: Logger
}): Promise<DbConnSql> => {
  const databaseType = connectionStringToDatabaseType(databaseUrl)

  switch (databaseType) {
    case "postgres": {
      return createDbConnPostgres({ databaseUrl, logger })
    }

    default: {
      throw new Error(`[db] unknown database type for ${databaseUrl}`)
    }
  }
}

type DatabaseType = "sqlite" | "postgres"

const connectionStringToDatabaseType = (
  connectionString: string,
): DatabaseType | null => {
  if (connectionString.includes("sqlite")) {
    return "sqlite"
  }

  if (connectionString.includes("postgres")) {
    return "postgres"
  }

  return null
}
