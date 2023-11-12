import { err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
// import pg from "pg";
import { Connection } from "postgresql-client";
import { toSql } from "./sql";

export const createDbConnPostgres = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<DbConnSql> => {
  // const pool = new pg.Pool({
  //   connectionString: databaseUrl,
  // });

  const connection = new Connection(databaseUrl);

  console.log("[postgres] connecting...");
  await connection.connect();
  console.log("[postgres] connected");

  return {
    query: async (isRow, rawSql, params) => {
      try {
        const sqlStr = toSql(rawSql, params);

        console.log("[postgres]", sqlStr);

        const interval = setInterval(() => {
          console.log("[postgres] waiting...");
        }, 1000);

        const res = await connection.query(sqlStr);

        clearInterval(interval);

        console.log("[postgres]", res.rows);

        const parsed =
          res.rows?.flatMap((row) => {
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
