import { err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { Database } from "bun:sqlite";

export const createDbConnSqlLite = ({
  connectionString,
}: {
  connectionString: string;
}): DbConnSql => {
  const database = new Database(connectionString);

  return {
    query: async (isRow, rawSql) => {
      try {
        const rows = await database.query(rawSql).get();

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
