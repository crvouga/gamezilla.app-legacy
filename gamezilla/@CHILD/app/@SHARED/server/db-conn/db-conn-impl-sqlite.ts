import { err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { toSql } from "./sql";

export const createDbConnSqlite = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<DbConnSql> => {
  const { Database } = await import("bun:sqlite");

  const cleaned = databaseUrl.replace("sqlite:", "");
  const database = new Database(cleaned);

  return {
    query: async (isRow, rawSql, params) => {
      try {
        const sql = toSql(rawSql, params);

        const rows = database.query(sql).all();

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
