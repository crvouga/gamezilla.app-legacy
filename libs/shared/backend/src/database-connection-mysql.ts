import { Result } from '@gamezilla/core';
import mysql from 'mysql2/promise';
import { ParserMyZodEsque } from './shared';

export type DatabaseConnectionMySQL = {
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

const create = ({
  connectionString,
}: {
  connectionString: string;
}): DatabaseConnectionMySQL => {
  const pool = mysql.createPool(connectionString);

  return {
    query: async (rowParser, text, values) => {
      try {
        const [rows, _fields] = await pool.query(text, values);

        const parsed = Array.isArray(rows)
          ? rows.map(rowParser.parse, values)
          : [];
        log('executed query', {
          text,
          values,
        });
        return Result.Ok(parsed);
      } catch (error) {
        log('error executing query', { text, error });
        console.log(error);
        return Result.Err(String(error));
      }
    },
  };
};

export const DatabaseConnectionMySQL = {
  create,
};
