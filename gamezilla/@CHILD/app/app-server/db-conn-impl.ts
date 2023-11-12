import { Result, err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "../@SHARED/server";
import { createDbConnPostgres } from "./db-conn-impl-postgres";
import { createDbConnSqlLite } from "./db-conn-impl-sql-lite";

export const createDbConn = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<Result<"not-supported", DbConnSql>> => {
  const databaseType = connectionStringToDatabaseType(databaseUrl);

  switch (databaseType) {
    case "sql-lite": {
      return ok(createDbConnSqlLite({ databaseUrl }));
    }

    case "postgres": {
      return ok(await createDbConnPostgres({ databaseUrl }));
    }

    case null: {
      return err("not-supported");
    }
  }
};

type DatabaseType = "sql-lite" | "postgres";

const connectionStringToDatabaseType = (
  connectionString: string
): DatabaseType | null => {
  if (connectionString.includes("postgres")) {
    return "postgres";
  }

  if (connectionString.includes("sqlite")) {
    return "sql-lite";
  }

  return null;
};
