import { DbConnSql } from "../@SHARED/server";
import { createDbConnMySql } from "./db-conn-impl-my-sql";
import { createDbConnPostgres } from "./db-conn-impl-postgres";
import { createDbConnSqlLite } from "./db-conn-impl-sql-lite";

export const createDbConn = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<DbConnSql> => {
  const databaseType = connectionStringToDatabaseType(databaseUrl);

  switch (databaseType) {
    case "my-sql": {
      return createDbConnMySql({ databaseUrl });
    }

    case "sql-lite": {
      return createDbConnSqlLite({ databaseUrl });
    }

    case "postgres": {
      return createDbConnPostgres({ databaseUrl });
    }
  }
};

type DatabaseType = "my-sql" | "sql-lite" | "postgres";

const connectionStringToDatabaseType = (
  connectionString: string
): DatabaseType => {
  if (connectionString.includes("my-sql")) {
    return "my-sql";
  }

  if (connectionString.includes("postgres")) {
    return "postgres";
  }

  return "sql-lite";
};
