import { Ok } from "gamezilla-app/@SHARED/core"
import { Logger } from "../logger"
import { IDbConnSql } from "./db-conn-sql"
import { createDbConnPostgres } from "./db-conn-sql-impl-postgres"

export const dbConnSqlNoop: IDbConnSql = {
  async query() {
    return Ok([])
  },
  async onNotification() {
    return () => {}
  },
}

export const DbConnSql = async ({
  databaseUrl,
  logger,
}: {
  databaseUrl: string
  logger: Logger
}): Promise<IDbConnSql> => {
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
