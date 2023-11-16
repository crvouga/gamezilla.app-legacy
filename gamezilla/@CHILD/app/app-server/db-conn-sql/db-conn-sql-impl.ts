import { Result, err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "../../@SHARED/server";

import { createDbConnSqlite } from "./db-conn-sql-impl-sqlite";
import { createDbConnPostgres } from "./db-conn-sql-impl-postgres";

export const createDbConn = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<Result<"not-supported", DbConnSql>> => {
  const databaseType = connectionStringToDatabaseType(databaseUrl);

  switch (databaseType) {
    case "sqlite": {
      return ok(await createDbConnSqlite({ databaseUrl }));
    }

    case "postgres": {
      return ok(await createDbConnPostgres({ databaseUrl }));
    }

    case null: {
      return err("not-supported");
    }
  }
};

type DatabaseType = "sqlite" | "postgres";

const connectionStringToDatabaseType = (
  connectionString: string
): DatabaseType | null => {
  if (connectionString.includes("sqlite")) {
    return "sqlite";
  }

  if (connectionString.includes("postgres")) {
    return "postgres";
  }

  return null;
};
