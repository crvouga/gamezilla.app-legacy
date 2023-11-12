import { err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import postgres from "postgres";
import { toSql } from "./sql";

export const createDbConnPostgres = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<DbConnSql> => {
  const sql = postgres(databaseUrl);

  return {
    query: async (isRow, rawSql, params) => {
      try {
        const sqlStr = toSql(rawSql, params);

        const rows = await sql`${sqlStr}`;

        const parsed = rows.flatMap((row) => {
          if (isRow(row)) {
            return [row];
          }
          return [];
        });

        return ok(parsed);
      } catch (error) {
        log("error executing query", { rawSql, error });
        console.log(error);
        return err(String(error));
      }
    },
  };
};

const debugging = false;

const log = (...args: unknown[]) => {
  if (debugging) {
    console.log(...args);
  }
};
