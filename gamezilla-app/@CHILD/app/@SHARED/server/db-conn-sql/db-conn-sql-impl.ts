import { ok } from "gamezilla-app/@SHARED/core"
import { Logger } from "../logger"
import { DbConnSql } from "."
import { createDbConnPostgres } from "./db-conn-sql-impl-postgres"
// import { createDbConnSqlite } from "./db-conn-sql-impl-sqlite"

export const dbConnNoop: DbConnSql = {
  query: async () => {
    return ok([])
  },
}

export const createDbConn = async ({
  databaseUrl,
  logger,
}: {
  databaseUrl: string
  logger: Logger
}): Promise<DbConnSql> => {
  const databaseType = connectionStringToDatabaseType(databaseUrl)

  switch (databaseType) {
    // case "sqlite": {
    //   return createDbConnSqlite({ databaseUrl, logger })
    // }

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
