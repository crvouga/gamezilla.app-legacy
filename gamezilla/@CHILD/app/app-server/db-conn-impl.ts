import { DbConnSql } from "../@SHARED/server";
import { createDbConnMySql } from "./db-conn-impl-my-sql";
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
  }
};

type DatabaseType = "my-sql" | "sql-lite";

const connectionStringToDatabaseType = (
  connectionString: string
): DatabaseType => {
  if (connectionString.includes("my-sql")) {
    return "my-sql";
  }

  return "sql-lite";
};
