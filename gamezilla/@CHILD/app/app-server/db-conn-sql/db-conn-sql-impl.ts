import { Result, err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "../../@SHARED/server";

import { createDbConnSqlite } from "./db-conn-sql-impl-sqlite";

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

    case null: {
      return err("not-supported");
    }
  }
};

type DatabaseType = "sqlite";

const connectionStringToDatabaseType = (
  connectionString: string
): DatabaseType | null => {
  if (connectionString.includes("sqlite")) {
    return "sqlite";
  }

  return null;
};
