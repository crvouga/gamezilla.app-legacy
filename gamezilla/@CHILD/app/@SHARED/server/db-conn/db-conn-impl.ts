import { Result, err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "..";
import { createDbConnPostgres } from "./db-conn-impl-postgres";
import { createDbConnSqlite } from "./db-conn-impl-sqlite";

export const createDbConn = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<Result<"not-supported", DbConnSql>> => {
  const databaseType = connectionStringToDatabaseType(databaseUrl);

  switch (databaseType) {
    case "sqlite": {
      return ok(createDbConnSqlite({ databaseUrl }));
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
  if (connectionString.includes("postgres")) {
    return "postgres";
  }

  if (connectionString.includes("sqlite")) {
    return "sqlite";
  }

  return null;
};
