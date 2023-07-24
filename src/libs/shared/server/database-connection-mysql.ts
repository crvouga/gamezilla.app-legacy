import { Err, Ok, Result } from "@gamezilla/core";
import * as mysql from "mysql2/promise";

export type ParserMyZodEsque<TInput> = {
  parse: (input: unknown) => TInput;
};

export type DbConnMySql = {
  query: <TRow>(
    rowParser: ParserMyZodEsque<TRow>,
    text: string,
    params?: unknown[]
  ) => Promise<Result<string, TRow[]>>;
};

const debugging = false;

const log = (...args: unknown[]) => {
  if (debugging) {
    console.log(...args);
  }
};

const create = async ({
  connectionString,
}: {
  connectionString: string;
}): Promise<DbConnMySql> => {
  const pool = mysql.createPool(connectionString);

  const getConnection = async (): Promise<mysql.PoolConnection> => {
    const conn = await pool.getConnection();

    const [rows] = await conn.query("SELECT 1");
    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
      conn.release();
      return getConnection();
    }

    return conn;
  };

  return {
    query: async (rowParser, text, values) => {
      try {
        const conn = await getConnection();
        const [rows, fields] = await conn.query(text, values);
        conn.release();

        const parsed = Array.isArray(rows)
          ? rows.map(rowParser.parse, values)
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

export const DbConnMySql = {
  create,
};
