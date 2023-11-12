import { err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import pg from "pg";
import { toSql } from "./sql";

export const createDbConnPostgres = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<DbConnSql> => {
  const pool = new pg.Pool({
    connectionString: databaseUrl,
  });

  return {
    query: async (isRow, rawSql, params) => {
      try {
        const sqlStr = toSql(rawSql, params);

        console.log("[db]", sqlStr);

        const res = await pool.query(sqlStr);

        console.log("[db]", res.rows);

        const parsed = res.rows.flatMap((row) => {
          if (isRow(row)) {
            return [row];
          }
          return [];
        });

        return ok(parsed);
      } catch (error) {
        console.log(error);
        return err(String(error));
      }
    },
  };
};
