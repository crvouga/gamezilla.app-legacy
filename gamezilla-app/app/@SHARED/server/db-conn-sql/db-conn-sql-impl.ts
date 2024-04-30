import { Ok } from "gamezilla-app/@shared/core"
import { ILogger } from "../logger/logger"
import { IDbConnSql } from "./db-conn-sql"
import { DbConnPostgres } from "./db-conn-sql-impl-postgres"

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
  logger: ILogger
}): Promise<IDbConnSql> => {
  const databaseType = connectionStringToDatabaseType(databaseUrl)

  switch (databaseType) {
    case "postgres": {
      return DbConnPostgres({ databaseUrl, logger })
    }

    default: {
      throw new Error(`unknown database type for ${databaseUrl}`)
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
