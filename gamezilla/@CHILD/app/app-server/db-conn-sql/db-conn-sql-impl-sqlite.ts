import { err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { toSql } from "./sql";
import { Database } from "bun:sqlite";

export const createDbConnSqlite = async ({
  databaseUrl,
}: {
  databaseUrl: string;
}): Promise<DbConnSql> => {
  const cleaned = databaseUrl.replace("sqlite:", "");
  const database = new Database(cleaned);

  return {
    query: async (isRow, rawSql, params) => {
      try {
        const sql = toSql(rawSql, params);

        console.log("[db]", sql);

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
        console.error("[db]", error);
        return err(String(error));
      }
    },
  };
};
