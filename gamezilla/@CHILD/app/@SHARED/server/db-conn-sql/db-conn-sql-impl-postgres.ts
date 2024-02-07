import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { Result, err, ok } from "gamezilla/@SHARED/core";
import postgres from "postgres";
import { toSql } from "./sql";
import { Logger } from "../../../@SHARED/server/logger";
import { logQuery } from "./shared";

export const createDbConnPostgres = async ({
  databaseUrl,
  logger,
}: {
  databaseUrl: string;
  logger: Logger;
}): Promise<Result<string, DbConnSql>> => {
  try {
    const database = postgres(databaseUrl);

    return ok({
      query: async (isRow, rawSql, params) => {
        const sql = toSql(rawSql, params);
        try {
          const start = Date.now();

          const rows = await database.unsafe(sql);

          const end = Date.now();

          logQuery({ logger, sql, start, end });

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
          logger.error(`[db] ${error} sql=${sql}`);
          return err(String(error));
        }
      },
    });
  } catch (error) {
    return err(String(error));
  }
};
