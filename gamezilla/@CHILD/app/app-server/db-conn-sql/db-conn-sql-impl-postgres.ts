import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { err, ok } from "gamezilla/@SHARED/core";
import postgres from "postgres";
import { toSql } from "./sql";

export const createDbConnPostgres = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<DbConnSql> => {
  const database = postgres(databaseUrl);

  return {
    query: async (isRow, rawSql, params) => {
      try {
        const sql = toSql(rawSql, params);

        const rows = await database.unsafe(sql);

        const parsed = Array.isArray(rows)
          ? rows.flatMap((row) => {
              if (isRow(row)) {
                return [row];
              }
              return [];
            })
          : [];

        return ok(parsed);
      } catch (error) {
        return err(String(error));
      }
    },
  };
};
