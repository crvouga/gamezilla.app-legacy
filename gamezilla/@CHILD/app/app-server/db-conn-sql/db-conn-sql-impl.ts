import { Result, err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "../../@SHARED/server";
import { createDbConnPostgres } from "./db-conn-sql-impl-postgres";
import { createDbConnSqlite } from "./db-conn-sql-impl-sqlite";
import { Logger } from "../../@SHARED/server/logger";

export const createDbConn = async ({
  databaseUrl,
  logger,
}: {
  databaseUrl: string;
  logger: Logger;
}): Promise<Result<"not-supported", DbConnSql>> => {
  const databaseType = connectionStringToDatabaseType(databaseUrl);

  switch (databaseType) {
    case "sqlite": {
      return ok(await createDbConnSqlite({ databaseUrl, logger }));
    }

    case "postgres": {
      return ok(await createDbConnPostgres({ databaseUrl, logger }));
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
