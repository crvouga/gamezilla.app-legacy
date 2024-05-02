import { DbConnSql, IDbConnSql } from "./db-conn-sql";
import { Logger } from "./logger";

export type ITestEnv =
  | {
      t: "unit";
    }
  | {
      t: "integration";
      dbConnSql: IDbConnSql;
    };

export const ServerTestEnv = async (): Promise<ITestEnv> => {
  if (process.env["IS_INTEGRATION_TEST"] === "true") {
    const DATABASE_URL = process.env["DATABASE_URL"];

    if (!DATABASE_URL) {
      throw new Error(`DATABASE_URL not set`);
    }

    const dbConnSql = await DbConnSql({
      databaseUrl: DATABASE_URL,
      logger: Logger({ t: "noop" }),
    });

    return {
      t: "integration",
      dbConnSql,
    };
  }

  return {
    t: "unit",
  };
};
