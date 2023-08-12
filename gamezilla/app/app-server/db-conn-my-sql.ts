import { Err, Ok } from "gamezilla/@/core";
import { DbConnSql } from "gamezilla/app/@/server";
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
    query: async (isRow, text, values) => {
      try {
        const conn = await getConnection();
        const [rows, fields] = await conn.query(text, values);
        conn.release();

        const parsed = Array.isArray(rows)
          ? rows.flatMap((row) => {
              if (isRow(row)) {
                return [row];
              }
              return [];
            }, values)
          : [];
        log("executed query", {
          text,
          values,
          fields,
        });
        return Ok(parsed);
      } catch (error) {
        log("error executing query", { text, error });
        console.log(error);
        return Err(String(error));
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
