import { err, ok } from "gamezilla/@SHARED/core";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { PoolConnection, createPool } from "mysql2/promise";

export const createDbConnMySql = async ({
  connectionString,
}: {
  connectionString: string;
}): Promise<DbConnSql> => {
  const pool = createPool(connectionString);

  const getConnection = async (): Promise<PoolConnection> => {
    const conn = await pool.getConnection();

    const [rows] = await conn.query("SELECT 1");
    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
      conn.release();
      return getConnection();
    }

    return conn;
  };

  return {
    query: async (isRow, rawSql) => {
      try {
        const conn = await getConnection();
        const [rows, fields] = await conn.query(rawSql);
        conn.release();

        const parsed = Array.isArray(rows)
          ? rows.flatMap((row) => {
              if (isRow(row)) {
                return [row];
              }
              return [];
            })
          : [];
        log("executed query", {
          rawSql,
          fields,
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
