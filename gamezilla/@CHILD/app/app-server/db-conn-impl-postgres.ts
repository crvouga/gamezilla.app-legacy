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
        const rawSqlStr = toSql(rawSql, params);

        console.log("[postgres]", rawSqlStr);

        const res = await sql.unsafe(rawSqlStr);

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
