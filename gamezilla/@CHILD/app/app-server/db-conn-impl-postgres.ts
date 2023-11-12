import { err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
// import pg from "pg";
// import { Connection } from "postgresql-client";
import postgres from "postgres";
import { toSql } from "./sql";

export const createDbConnPostgres = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<DbConnSql> => {
  // const pool = new pg.Pool({
  //   connectionString: databaseUrl,
  // });
  // const connection = new Connection(databaseUrl);
  const pg = postgres(databaseUrl);
  return {
    query: async (isRow, rawSql, params) => {
      try {
        const sqlStr = toSql(rawSql, params);

        console.log("[postgres]", sqlStr);

        const interval = setInterval(() => {
          console.log("[postgres] waiting...");
        }, 1000);

        const res = await pg.unsafe(sqlStr);

        clearInterval(interval);

        console.log("[postgres]", res);

        const parsed =
          res?.flatMap((row) => {
            if (isRow(row)) {
              return [row];
            }
            return [];
          }) ?? [];

        return ok(parsed);
      } catch (error) {
        console.log(error);
        return err(String(error));
      }
    },
  };
};
